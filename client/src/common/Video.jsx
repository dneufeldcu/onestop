import React from 'react'

export default class Video extends React.Component {
  componentDidMount() {
    // need to set dimensions intially before resize events
    this.debounceResize()
    // subsequent resize event will retrigger our calculation
    window.addEventListener('resize', this.debounceResize)
  }

  componentWillUnmount() {
    // remember to remove custom listeners before unmounting
    window.removeEventListener('resize', this.debounceResize)
  }

  debounceResize = () => {
    // prevent resize work unless threshold is reached
    // this helps ensure the new width doesn't stick on a transient value
    const resizeThreshold = 250 // ms
    clearTimeout(this.resizeId)
    this.resizeId = setTimeout(this.resize, resizeThreshold)
  }

  resize = () => {
    // do work only if iframe exists
    if (this.iframeRef) {
      // recall our aspect ratio from props
      const {aspectRatio} = this.props
      // get new width dynamically
      const iframeRect = this.iframeRef.getBoundingClientRect()
      const newWidth = iframeRect.width
      // maintain aspect ratio when setting height
      this.iframeRef.style.height = newWidth * aspectRatio + 'px'
    }
  }

  render() {
    const {link} = this.props
    return (
      <iframe
        ref={iframeRef => {
          this.iframeRef = iframeRef
        }}
        src={link}
        frameBorder={0}
        allowFullScreen={true}
        style={{width: '100%'}}
      />
    )
  }
}
