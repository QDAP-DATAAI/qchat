export default function VideoPlayer(): JSX.Element {
  const src = "https://www.youtube.com/embed/sTnm5jvjgjM"

  return <iframe src={src} allowFullScreen title="YouTube Video" />
}
