import re
import json
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple


def extract_brace_block(
    code: str, start_index: int
) -> Tuple[Optional[str], Optional[int]]:
    """Extract content between matching braces starting at start_index."""
    brace_count = 0
    body = []
    for i in range(start_index, len(code)):
        c = code[i]
        if c == "{":
            brace_count += 1
            if brace_count == 1:
                continue
        elif c == "}":
            brace_count -= 1
            if brace_count == 0:
                return "".join(body), i
        if brace_count >= 1:
            body.append(c)
    return None, None


def find_matching_paren(code: str, start_index: int) -> Optional[int]:
    """Return the matching closing parenthesis index for start_index."""
    paren_count = 0
    for i in range(start_index, len(code)):
        c = code[i]
        if c == "(":
            paren_count += 1
        elif c == ")":
            paren_count -= 1
            if paren_count == 0:
                return i
    return None


def extract_apply_block_logic(code: str, control_name: str) -> Dict[str, Any]:
    """Extract detailed apply block logic from a control block."""
    # Find the control block
    control_pattern = rf"control\s+{control_name}\s*\([^)]*\)\s*\{{"
    match = re.search(control_pattern, code, re.MULTILINE)
    if not match:
        return {"logic": [], "conditions": [], "tables_applied": []}

    # Extract the entire control block
    block_start = match.end()
    block_body, _ = extract_brace_block(code, block_start - 1)
    if not block_body:
        return {"logic": [], "conditions": [], "tables_applied": []}

    # Find apply block
    apply_match = re.search(r"apply\s*\{", block_body)
    if not apply_match:
        return {"logic": [], "conditions": [], "tables_applied": []}

    apply_start = apply_match.end()
    apply_body, _ = extract_brace_block(block_body, apply_start - 1)
    if not apply_body:
        return {"logic": [], "conditions": [], "tables_applied": []}

    # Parse apply block content
    logic = []
    conditions = []
    tables_applied = []

    # Extract if conditions (handle nested braces properly)
    # First, find all if statements with proper brace matching
    i = 0
    if_ranges = []
    while i < len(apply_body):
        if apply_body[i : i + 2] == "if":
            # Find the condition
            paren_start = apply_body.find("(", i)
            if paren_start == -1:
                i += 1
                continue
            paren_end = find_matching_paren(apply_body, paren_start)
            if paren_end is None:
                i += 1
                continue

            condition = apply_body[paren_start + 1 : paren_end].strip()

            # Find the opening brace
            brace_start = apply_body.find("{", paren_end)
            if brace_start == -1:
                i += 1
                continue

            # Extract the body with proper brace matching
            if_body, brace_end = extract_brace_block(apply_body, brace_start)
            if if_body is not None:
                conditions.append(
                    {"condition": condition, "body": if_body, "type": "if"}
                )
                if_ranges.append((i, brace_end + 1))
                # Extract tables from if body
                tables_in_if = re.findall(r"(\w+)\.apply\(\)", if_body)
                tables_applied.extend(tables_in_if)
                logic.append(
                    f"if ({condition}) then apply: {', '.join(tables_in_if) if tables_in_if else 'no tables'}"
                )
                i = brace_end + 1
            else:
                i += 1
        else:
            i += 1

    # Extract direct table applications (not in if blocks)
    cleaned_parts = []
    cursor = 0
    for start, end in if_ranges:
        cleaned_parts.append(apply_body[cursor:start])
        cursor = end
    cleaned_parts.append(apply_body[cursor:])
    cleaned_body = "".join(cleaned_parts)

    direct_tables = re.findall(r"(\w+)\.apply\(\)", cleaned_body)
    tables_applied.extend(direct_tables)
    for table in direct_tables:
        logic.append(f"apply {table}()")

    return {
        "logic": logic,
        "conditions": conditions,
        "tables_applied": list(set(tables_applied)),  # Remove duplicates
        "raw_apply_body": apply_body.strip(),
    }


def extract_actions_from_control(code: str, control_name: str) -> List[Dict[str, Any]]:
    """Extract action definitions from a control block."""
    control_pattern = rf"control\s+{control_name}\s*\([^)]*\)\s*\{{"
    match = re.search(control_pattern, code, re.MULTILINE)
    if not match:
        return []

    block_start = match.end()
    block_body, _ = extract_brace_block(code, block_start - 1)
    if not block_body:
        return []

    actions = []
    # Find all action definitions
    action_pattern = r"action\s+(\w+)\s*\(([^)]*)\)\s*\{([^}]+)\}"
    for action_match in re.finditer(action_pattern, block_body, re.DOTALL):
        action_name = action_match.group(1)
        params = action_match.group(2).strip()
        body = action_match.group(3).strip()

        # Parse parameters
        param_list = []
        if params:
            for p in params.split(","):
                p = p.strip()
                if p:
                    parts = p.split()
                    if len(parts) >= 2:
                        param_list.append({"type": parts[0], "name": parts[-1]})

        # Extract action body operations
        operations = []
        if "mark_to_drop" in body:
            operations.append("mark_to_drop")
        if "standard_metadata.egress_spec" in body:
            operations.append("set_egress_port")
        if "hdr." in body:
            operations.append("modify_headers")

        actions.append(
            {
                "name": action_name,
                "parameters": param_list,
                "operations": operations,
                "body_preview": body[:200] + "..." if len(body) > 200 else body,
            }
        )

    return actions


def parse_p4_structure(path: str) -> Dict[str, Any]:
    """Parse P4 file and extract comprehensive structure."""
    with open(path, encoding="utf-8") as f:
        code = f.read()
    structure = {}

    # --- Base blocks (parser, controls, deparser) ---
    for block_type in ["parser", "control", "deparser"]:
        for name in re.findall(rf"{block_type}\s+(\w+)", code):
            structure[name] = {
                "type": block_type,
                "actions": [],
                "tables": [],
                "externs": [],
                "consts": [],
                "headers": [],
                "apply_logic": {},
            }

    # --- Tables: match fields + keys + actions ---
    # Improved regex to handle multi-line table definitions
    table_pattern = re.compile(
        r"table\s+(\w+)\s*\{([^}]*?key\s*=\s*\{([^}]*)\}[^}]*?actions\s*=\s*\{([^}]*)\}[^}]*?)\}",
        re.S,
    )
    tables = {}
    for match in table_pattern.finditer(code):
        name = match.group(1)
        full_table = match.group(2)
        keys_raw = match.group(3)
        acts_raw = match.group(4)

        keys = [
            k.strip().replace("\n", " ").replace("\t", " ")
            for k in keys_raw.split(";")
            if k.strip()
        ]
        acts = [
            a.strip().split("(")[0].strip() for a in acts_raw.split(";") if a.strip()
        ]

        # Extract table properties
        size_match = re.search(r"size\s*=\s*(\d+)", full_table)
        size = int(size_match.group(1)) if size_match else None

        default_action_match = re.search(
            r"default_action\s*=\s*(\w+)\s*\([^)]*\)", full_table
        )
        default_action = default_action_match.group(1) if default_action_match else None

        tables[name] = {
            "keys": keys,
            "actions": acts,
            "size": size,
            "default_action": default_action,
        }

    # --- Extract actions from control blocks ---
    control_actions = {}
    for name in structure.keys():
        if structure[name]["type"] == "control":
            control_actions[name] = extract_actions_from_control(code, name)
            structure[name]["actions"] = control_actions[name]

    # --- Extract apply block logic ---
    for name in structure.keys():
        if structure[name]["type"] == "control":
            apply_logic = extract_apply_block_logic(code, name)
            structure[name]["apply_logic"] = apply_logic
            # Update tables list from apply logic
            structure[name]["tables"] = apply_logic.get("tables_applied", [])

    # --- Parser states and transitions ---
    for name in structure.keys():
        if structure[name]["type"] == "parser":
            parser_pattern = rf"parser\s+{name}\s*\([^)]*\)\s*\{{"
            match = re.search(parser_pattern, code, re.MULTILINE)
            if match:
                block_start = match.end()
                block_body, _ = extract_brace_block(code, block_start - 1)
                if block_body:
                    # Extract states
                    states = re.findall(r"state\s+(\w+)\s*\{", block_body)
                    extracts = re.findall(r"packet\.extract\(([^)]+)\)", block_body)
                    transitions = re.findall(r"transition\s+(\w+)", block_body)

                    structure[name]["states"] = states
                    structure[name]["extracts"] = extracts
                    structure[name]["transitions"] = transitions

    # --- Constants / enums ---
    consts = re.findall(r"const\s+(\w+)\s+([0-9xa-fA-F]+)", code)
    enums = re.findall(r"enum\s+(\w+)\s*\{([^}]*)\}", code, re.S)
    enum_map = {
        name: [v.split("=")[0].strip() for v in body.split(",") if v.strip()]
        for name, body in enums
    }

    # --- Externs ---
    externs = re.findall(r"(Counter|Meter|Register|Digest)\s*<[^>]*>\s+(\w+)", code)
    extern_objs = [{"type": e[0], "name": e[1]} for e in externs]

    # --- Headers ---
    headers = re.findall(r"header\s+(\w+)\s*\{([^}]*)\}", code, re.S)
    header_defs = {}
    for name, body in headers:
        fields = []
        for f in body.split(";"):
            f = f.strip()
            if not f:
                continue
            if ":" in f:
                parts = f.split(":")
                if len(parts) == 2:
                    field_name = parts[0].strip()
                    field_type = parts[1].strip()
                    fields.append(
                        {
                            "field": field_name,
                            "bits": field_type,
                            "type": "bit" if "bit<" in field_type else "other",
                        }
                    )
            else:
                match = re.match(r"([\w<>]+)\s+(\w+)$", f)
                if match:
                    field_type, field_name = match.groups()
                    fields.append(
                        {
                            "field": field_name,
                            "bits": field_type,
                            "type": "bit" if "bit<" in field_type else "other",
                        }
                    )
        header_defs[name] = fields

    # --- Assemble global info ---
    structure["_tables"] = tables
    structure["_consts"] = consts
    structure["_enums"] = enum_map
    structure["_externs"] = extern_objs
    structure["_headers"] = header_defs
    structure["_filename"] = Path(path).name

    return structure


if __name__ == "__main__":
    import sys

    print(json.dumps(parse_p4_structure(sys.argv[1]), indent=2))
