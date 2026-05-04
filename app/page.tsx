const services = [
  {
    title: "Product Engineering",
    description: "From early product shape to production releases, we design and build web platforms that are clear, durable, and ready to grow.",
  },
  {
    title: "Internal Systems",
    description: "Dashboards, admin tools, workflows, and reporting surfaces that remove operational drag from everyday work.",
  },
  {
    title: "Technical Consulting",
    description: "Architecture reviews, deployment strategy, integration planning, and focused engineering support for teams that need momentum.",
  },
];

const dashboardSamples = [
  {
    name: "Operations Console",
    metric: "98.4%",
    label: "Task completion",
    accent: "bg-cyan-400",
    rows: ["Inventory sync", "Device rollout", "Field support"],
  },
  {
    name: "Revenue Workspace",
    metric: "$428K",
    label: "Pipeline value",
    accent: "bg-lime-400",
    rows: ["Forecasting", "Client health", "Billing review"],
  },
  {
    name: "AI Review Desk",
    metric: "14h",
    label: "Time saved weekly",
    accent: "bg-rose-400",
    rows: ["Document triage", "Quality checks", "Action routing"],
  },
];

const process = ["Frame the problem", "Prototype the workflow", "Build the system", "Launch and improve"];

function DashboardSample({
  sample,
  index,
}: {
  sample: (typeof dashboardSamples)[number];
  index: number;
}) {
  return (
    <article className="border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-950">{sample.name}</p>
          <p className="mt-1 text-xs text-zinc-500">Placeholder dashboard sample {index + 1}</p>
        </div>
        <span className={`h-3 w-3 ${sample.accent}`} />
      </div>

      <div className="grid grid-cols-[1fr_92px] gap-4">
        <div>
          <p className="font-mono text-3xl font-semibold text-zinc-950">{sample.metric}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">{sample.label}</p>
        </div>
        <div className="grid h-20 grid-cols-4 items-end gap-1">
          {[38, 54, 45, 74, 58, 88, 70, 96].map((height, barIndex) => (
            <span
              className="bg-zinc-900"
              key={`${sample.name}-${barIndex}`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {sample.rows.map((row) => (
          <div className="grid grid-cols-[12px_1fr_54px] items-center gap-3" key={row}>
            <span className={`h-2 w-2 ${sample.accent}`} />
            <span className="text-sm text-zinc-700">{row}</span>
            <span className="h-2 bg-zinc-100" />
          </div>
        ))}
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] text-zinc-950">
      <section className="relative overflow-hidden border-b border-zinc-200 bg-[#f7f4ee]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,24,27,0.06)_1px,transparent_1px),linear-gradient(180deg,rgba(24,24,27,0.06)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="relative mx-auto grid min-h-[calc(92vh-5rem)] max-w-7xl content-between px-6 pb-6 sm:px-8 lg:px-10">
          <div className="grid items-end gap-12 py-16 lg:grid-cols-[1fr_520px] lg:py-20">
            <div>
              <p className="mb-5 inline-flex border border-zinc-950 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]">
                Design. Develop. Deploy.
              </p>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-tight text-zinc-950 sm:text-7xl lg:text-8xl">
                Two states, One system.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-700 sm:text-xl">
                We help founders and operators turn messy requirements into useful web applications,
                internal systems, dashboards, and cloud-backed workflows.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  className="inline-flex h-12 items-center justify-center bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800"
                  href="#contact"
                >
                  Start a conversation
                </a>
                <a
                  className="inline-flex h-12 items-center justify-center border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-950 transition hover:border-zinc-950"
                  href="#samples"
                >
                  View dashboard samples
                </a>
              </div>
            </div>

            <div className="border border-zinc-950 bg-zinc-950 p-3 text-white shadow-2xl shadow-zinc-900/20">
              <div className="border border-white/10 bg-[#101014] p-4">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">System snapshot</p>
                    <p className="mt-1 text-lg font-semibold">Service delivery board</p>
                  </div>
                  <span className="bg-cyan-300 px-2 py-1 font-mono text-xs font-semibold text-zinc-950">LIVE</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["Discovery", "Build", "Launch"].map((item, index) => (
                    <div className="border border-white/10 bg-white/[0.04] p-3" key={item}>
                      <p className="font-mono text-2xl font-semibold">{index === 0 ? "04" : index === 1 ? "11" : "02"}</p>
                      <p className="mt-2 text-xs text-zinc-400">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 space-y-3">
                  {["Client portal", "Ops dashboard", "Data workflow", "Deployment review"].map((item, index) => (
                    <div className="grid grid-cols-[1fr_80px] items-center gap-4" key={item}>
                      <span className="text-sm text-zinc-300">{item}</span>
                      <span className="h-2 bg-white/10">
                        <span
                          className="block h-2 bg-cyan-300"
                          style={{ width: `${[78, 63, 88, 45][index]}%` }}
                        />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-zinc-300 py-5 text-sm text-zinc-600 sm:grid-cols-3">
            <p>Web applications</p>
            <p>Dashboards and internal tools</p>
            <p>Cloud deployment and integrations</p>
          </div>
        </div>
      </section>

      <section className="bg-white py-20" id="services">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.4fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">What we do</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Software development services with a builder&apos;s bias.
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {services.map((service) => (
                <article className="border border-zinc-200 p-5" key={service.title}>
                  <h3 className="text-lg font-semibold">{service.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-zinc-600">{service.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 py-20 text-white" id="samples">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Dashboard samples</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Placeholder interfaces for the kind of systems Binate can shape.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-zinc-400">
              These are sample directions for operational products, reporting tools, and AI-assisted review surfaces.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {dashboardSamples.map((sample, index) => (
              <DashboardSample key={sample.name} sample={sample} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eef7f3] py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Working model</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Clear enough for strategy, concrete enough for shipping.
            </h2>
          </div>
          <div className="grid gap-3">
            {process.map((step, index) => (
              <div className="grid grid-cols-[64px_1fr] border border-zinc-300 bg-white" key={step}>
                <span className="flex h-16 items-center justify-center border-r border-zinc-300 font-mono text-sm text-zinc-500">
                  0{index + 1}
                </span>
                <span className="flex h-16 items-center px-5 text-lg font-semibold">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20" id="contact">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <div className="grid gap-8 border border-zinc-950 bg-[#f7f4ee] p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Let&apos;s build the useful part first</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Bring the workflow, idea, or system that needs sharper software.
              </h2>
            </div>
            <a
              className="inline-flex h-12 items-center justify-center bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800"
              href="mailto:hello@binate-labs.com"
            >
              hello@binate-labs.com
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
