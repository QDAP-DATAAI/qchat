import { Suspense } from "react"

import { APP_VERSION } from "@/app-global"

import Typography from "@/components/typography"
import VideoPlayer from "@/features/ui/video-player"

export const dynamic = "force-dynamic"

const Home = (): JSX.Element => {
  return (
    <div className="flex h-full flex-1 justify-center">
      <div className="flex flex-col gap-8 py-8">
        <div className="prose max-w-4xl break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
          <Typography variant="h3">App Version {APP_VERSION}</Typography>
          <Suspense fallback={<p>Loading video...</p>}>
            <VideoPlayer />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default Home
