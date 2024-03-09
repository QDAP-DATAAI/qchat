import { Reporting, ReportingProp } from "@/features/reporting/reporting"

export default async function Home(props: ReportingProp): Promise<JSX.Element> {
  return <Reporting {...props} />
}
