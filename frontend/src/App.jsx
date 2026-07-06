import { useState } from "react";
import axios from "axios";
import PipelineFlow from "@/components/ui/PipelineFlow";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  FiUpload,
  FiCheckCircle,
  FiAlertCircle,
  FiDatabase,
  FiCode,
  FiLayers,
} from "react-icons/fi";

const defaultApiBase =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)
    ? "http://localhost:8000"
    : "/api";

const API_BASE = (import.meta.env.VITE_API_BASE || defaultApiBase).replace(/\/$/, "");
const CREATOR = {
  name: "Sankalp Jha",
  url: "https://sankalpjha.dev",
};
const P4_LINKS = {
  org: "https://github.com/p4lang",
  p414: "https://github.com/p4lang/p4-spec/tree/main/p4-14",
  p416: "https://github.com/p4lang/p4-spec/tree/main/p4-16",
};

export default function App() {
  const [file, setFile] = useState(null);
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Upload and parse
  const upload = async () => {
    if (!file) {
      setError("Please choose a P4 file first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await axios.post(`${API_BASE}/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Parsed structure:", res.data.structure);
      setStructure(res.data.structure);
    } catch (err) {
      console.error("Upload error:", err);
      const errorMsg = err.response?.data?.detail || err.message || "Failed to parse P4 file. Please check the file format.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Reset
  const reset = () => {
    setStructure(null);
    setFile(null);
    setError(null);
  };

  // Loading / Upload View
  if (!structure || Object.keys(structure).length === 0) {
    return (
      <div className="p4-ambient min-h-screen overflow-x-hidden bg-[#050505] text-[#f7f4ff]">
        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
          <a href="/" className="text-2xl font-black tracking-tight text-[#fbf9ff] drop-shadow-[0_0_14px_rgba(124,194,66,0.28)]">
            P4Lens
          </a>
          <div className="hidden items-center gap-6 text-sm text-[#bdb2d6] sm:flex">
            <a
              href={P4_LINKS.org}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 hover:text-[#7cc242] hover:underline"
            >
              p4lang
            </a>
            <a
              href={CREATOR.url}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 hover:text-[#7cc242] hover:underline"
            >
              {CREATOR.name}
            </a>
          </div>
        </header>

        <main className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-6 pb-10 pt-4 lg:min-h-[calc(100vh-84px)] lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:gap-8 lg:py-6">
          <section className="p4-hero-shell relative z-10 max-w-4xl overflow-hidden border border-white/10 px-5 py-6 shadow-[0_24px_70px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-7 sm:py-8 lg:px-8 lg:py-9">
            <div className="relative z-10">
            <h1 className="max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tight text-[#fbf9ff] drop-shadow-[0_0_28px_rgba(115,87,165,0.26)] sm:text-5xl lg:text-6xl xl:text-[5.4rem]">
              See the packet path before you read the code.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#c8bfd9] sm:text-lg">
              Upload a P4 program and turn parser states, match-action tables, headers, actions, and apply logic into a visual pipeline workspace.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={P4_LINKS.p414}
                target="_blank"
                rel="noreferrer"
                className="border border-white/10 bg-black/70 px-4 py-2 text-sm font-semibold text-[#efe7ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition hover:border-[#7357a5] hover:bg-[#7357a5]/20 hover:text-white hover:shadow-[0_0_22px_rgba(115,87,165,0.24)]"
              >
                P4 14 spec
              </a>
              <a
                href={P4_LINKS.p416}
                target="_blank"
                rel="noreferrer"
                className="border border-[#7cc242]/40 bg-black/70 px-4 py-2 text-sm font-semibold text-[#dff8c9] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition hover:border-[#7cc242] hover:bg-[#7cc242]/20 hover:text-white hover:shadow-[0_0_22px_rgba(124,194,66,0.18)]"
              >
                P4 16 spec
              </a>
              <a
                href={P4_LINKS.org}
                target="_blank"
                rel="noreferrer"
                className="border border-white/10 bg-black/70 px-4 py-2 text-sm font-semibold text-[#d7c9ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition hover:border-[#7357a5] hover:bg-[#7357a5]/20 hover:text-white hover:shadow-[0_0_20px_rgba(115,87,165,0.22)]"
              >
                p4lang GitHub
              </a>
            </div>

            <div className="mt-8 grid max-w-3xl grid-cols-1 border-y border-white/10 bg-black/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm sm:grid-cols-3 lg:mt-10">
              {[
                { icon: FiLayers, label: "Pipeline", value: "Parser to deparser" },
                { icon: FiDatabase, label: "Tables", value: "Keys and actions" },
                { icon: FiCode, label: "Logic", value: "Apply flow" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="border-white/10 py-4 transition hover:bg-[#7357a5]/10 sm:border-r sm:px-5 first:sm:pl-5 last:sm:border-r-0">
                    <Icon className="mb-4 h-5 w-5 text-[#7cc242] drop-shadow-[0_0_12px_rgba(124,194,66,0.45)]" />
                    <div className="text-sm font-semibold uppercase text-[#fbf9ff]">{item.label}</div>
                    <div className="mt-2 text-sm text-[#afa2c9]">{item.value}</div>
                  </div>
                );
              })}
            </div>
            </div>
          </section>

          <section className="relative z-10 w-full lg:self-center">
            <Card className="overflow-hidden rounded-none border-white/10 bg-black/90 text-[#f7f4ff] shadow-2xl shadow-black/70 backdrop-blur-md">
              <CardHeader className="border-b border-white/10 p-5">
                <CardTitle className="text-2xl">Analyze a P4 file</CardTitle>
                <CardDescription className="text-base text-[#bdb2d6]">
                  Choose a `.p4` program to build the pipeline view.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept=".p4"
                    onChange={(e) => {
                      setFile(e.target.files[0]);
                      setError(null);
                    }}
                    className="hidden"
                  />
                  <div className="group flex min-h-36 w-full flex-col items-center justify-center border border-dashed border-white/10 bg-[#050505] px-6 py-6 text-center shadow-[inset_0_0_40px_rgba(255,255,255,0.03)] transition duration-300 hover:border-[#7357a5] hover:bg-black hover:shadow-[inset_0_0_48px_rgba(115,87,165,0.14),0_0_26px_rgba(115,87,165,0.14)]">
                    {file ? (
                      <FiCheckCircle className="mb-4 h-9 w-9 text-[#7cc242] transition group-hover:scale-105" />
                    ) : (
                      <FiUpload className="mb-4 h-9 w-9 text-[#7cc242]/80 transition group-hover:scale-105 group-hover:text-[#7cc242]" />
                    )}
                    <p className="max-w-full truncate text-base font-semibold text-[#fbf9ff]">
                      {file ? file.name : "Select your P4 source"}
                    </p>
                    <p className="mt-2 text-sm text-[#afa2c9]">
                      {file ? "Ready for parsing and visualization" : "Only .p4 files are accepted"}
                    </p>
                  </div>
                </label>

                <Button
                  onClick={upload}
                  disabled={loading || !file}
                  size="lg"
                  className="h-12 w-full rounded-none border border-[#7cc242]/70 bg-[#7cc242] text-base font-semibold text-[#071004] shadow-[0_0_24px_rgba(124,194,66,0.22),inset_0_1px_0_rgba(255,255,255,0.32)] hover:border-[#7357a5] hover:bg-[#93db54] hover:shadow-[0_0_28px_rgba(115,87,165,0.25)] disabled:border-white/10 disabled:bg-[#101010] disabled:text-[#60576d]"
                >
                  {loading ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing program
                    </>
                  ) : (
                    <>
                      <FiUpload className="h-5 w-5" />
                      Visualize pipeline
                    </>
                  )}
                </Button>

                {error && (
                  <Alert variant="destructive" className="rounded-none">
                    <FiAlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="border border-white/10 bg-black p-4 font-mono text-xs leading-6 text-[#f0eaff] shadow-[inset_0_0_28px_rgba(255,255,255,0.035)]">
                  <div className="text-[#78649f]">pipeline preview</div>
                  <div><span className="text-[#7cc242]">parser</span> - ingress - egress - deparser</div>
                  <div><span className="text-[#b89fff]">extract</span> headers, keys, actions, transitions</div>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    );
  }

  // Visualization View
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <PipelineFlow structure={structure} creator={CREATOR} />
      <div className="absolute left-4 top-[5.75rem] z-10 sm:left-6 sm:top-24">
        <Button
          onClick={reset}
          variant="outline"
          className="rounded-none border-white/10 bg-black/90 text-[#f7f4ff] shadow-lg backdrop-blur-sm hover:border-[#7357a5] hover:bg-[#0b0b0b] hover:text-white hover:shadow-[0_0_22px_rgba(115,87,165,0.2)]"
        >
          Upload another file
        </Button>
      </div>
    </div>
  );
}
