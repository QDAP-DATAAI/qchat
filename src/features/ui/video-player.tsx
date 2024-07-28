export const VideoPlayer = ({ videoId }: { videoId: string }): JSX.Element => {
  return (
    <div className="video-responsive">
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        allowFullScreen
        title="Embedded youtube"
      ></iframe>
    </div>
  )
}

export default VideoPlayer
