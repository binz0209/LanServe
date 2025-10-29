import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";

function PrettyBlock({ label, value }) {
  const text =
    typeof value === "string"
      ? value
      : (() => {
          try { return JSON.stringify(value, null, 2); }
          catch { return String(value); }
        })();
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-gray-600">{label}</div>
      <pre className="text-xs bg-gray-50 rounded p-3 overflow-auto max-h-72">
        {text}
      </pre>
    </div>
  );
}

export default function DbTest() {
  const [endpoint, setEndpoint] = useState("/api/Categories"); // đổi tùy ý
  const [method, setMethod] = useState("GET");
  const [bodyText, setBodyText] = useState("{\n  \n}");
  const [loading, setLoading] = useState(false);
  const [resMeta, setResMeta] = useState(null);
  const [resData, setResData] = useState(null);
  const [error, setError] = useState("");

  const parsedBody = useMemo(() => {
    if (method === "GET" || method === "DELETE") return undefined;
    try {
      const t = bodyText.trim();
      if (!t) return undefined;
      return JSON.parse(t);
    } catch {
      return "__INVALID_JSON__";
    }
  }, [bodyText, method]);

  const callApi = async () => {
    setLoading(true);
    setError("");
    setResMeta(null);
    setResData(null);

    if (parsedBody === "__INVALID_JSON__") {
      setLoading(false);
      setError("Body JSON không hợp lệ.");
      return;
    }

    const start = performance.now();
    try {
      const res = await api.request({
        url: endpoint,
        method,
        data: parsedBody,
        transformResponse: [(data) => { try { return JSON.parse(data); } catch { return data; } }],
        validateStatus: () => true, // nhận cả 4xx/5xx để in ra
      });
      const dur = Math.round(performance.now() - start);
      setResMeta({
        status: res.status,
        statusText: res.statusText,
        durationMs: dur,
        headers: res.headers,
        url: res.config?.baseURL ? `${res.config.baseURL}${res.config.url}` : res.config?.url,
        method: res.config?.method?.toUpperCase(),
      });
      setResData(res.data);
    } catch (e) {
      const dur = Math.round(performance.now() - start);
      setResMeta({ status: null, statusText: "Network Error", durationMs: dur, headers: {}, url: endpoint, method });
      setError(JSON.stringify(e?.toJSON?.() || { message: e?.message || "Network Error", code: e?.code }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const autoDetect = async () => {
    const candidates = [
      "/api/users",
      "/api/userprofiles",
      "/api/categories",
      "/api/skills",
      "/api/projects",
      "/api/projectskills",
      "/api/proposals",
      "/api/contracts",
      "/api/messages",
      "/api/notifications",
      "/api/reviews",
      "/api/payments",
    ];
    for (const ep of candidates) {
      try {
        const res = await api.get(ep, { validateStatus: () => true });
        if (res.status >= 200 && res.status < 300) {
          setEndpoint(ep);
          setResMeta({
            status: res.status,
            statusText: res.statusText,
            durationMs: null,
            headers: res.headers,
            url: res.config?.baseURL ? `${res.config.baseURL}${res.config.url}` : res.config?.url,
            method: "GET",
          });
          setResData(res.data);
          setError("");
          return;
        }
      } catch { }
    }
    setError("Auto-detect: không tìm thấy endpoint nào trả 200.");
  };

  useEffect(() => { callApi(); /* lần đầu */ }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">DB Test / API Echo</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
        <div className="md:col-span-2 flex items-center gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="border rounded-lg px-2 py-2 text-sm"
          >
            {["GET", "POST", "PUT", "PATCH", "DELETE"].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="/api/users"
            className="border rounded-lg px-3 py-2 text-sm w-full"
          />
          <button onClick={callApi} disabled={loading}
            className="px-3 py-2 text-sm rounded-lg shadow border bg-white hover:bg-gray-50 disabled:opacity-60">
            {loading ? "Đang gọi..." : "Gọi"}
          </button>
          <button onClick={autoDetect}
            className="px-3 py-2 text-sm rounded-lg shadow border bg-white hover:bg-gray-50">
            Auto-detect
          </button>
        </div>

        <div className="md:col-span-1">
          {(method === "POST" || method === "PUT" || method === "PATCH") && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-600">Body (JSON)</div>
              <textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                spellCheck={false}
                rows={6}
                className="w-full border rounded-lg p-2 text-xs font-mono"
                placeholder='{"key": "value"}'
              />
              {parsedBody === "__INVALID_JSON__" && (
                <div className="text-xs text-red-600">JSON không hợp lệ</div>
              )}
            </div>
          )}
        </div>
      </div>

      {resMeta && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="text-sm"><b>URL:</b> {resMeta.url}</div>
            <div className="text-sm">
              <b>Method:</b> {resMeta.method} &nbsp;|&nbsp;
              <b>Status:</b> {resMeta.status ?? "—"} {resMeta.statusText && `(${resMeta.statusText})`} &nbsp;|&nbsp;
              {resMeta.durationMs != null && (<><b>Time:</b> {resMeta.durationMs} ms</>)}
            </div>
            <PrettyBlock label="Headers" value={resMeta.headers} />
          </div>
          <div className="space-y-2">
            <PrettyBlock label="Response data" value={resData} />
            {error && <PrettyBlock label="Error (raw)" value={error} />}
          </div>
        </div>
      )}

      {!resMeta && error && (
        <div className="text-red-600 text-sm whitespace-pre-wrap">{error}</div>
      )}
    </div>
  );
}
