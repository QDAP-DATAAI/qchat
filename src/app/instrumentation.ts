import { AzureMonitorTraceExporter } from "@azure/monitor-opentelemetry-exporter"
import { registerOTel } from "@vercel/otel"

import { AI_NAME } from "@/features/theme/theme-config"

const serviceName = AI_NAME

export function register(): void {
  registerOTel({
    serviceName: serviceName,
    traceExporter: new AzureMonitorTraceExporter({
      connectionString: process.env.NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING,
    }),
  })
}
