import React, { PropTypes } from 'react'
import _ from 'lodash'
import infoCircle from 'fa/info-circle.svg'
import star from 'fa/star.svg'
import starO from 'fa/star-o.svg'
import starHalfO from 'fa/star-half-o.svg'
import styles from './detail-views.css'
import A from 'LinkComponent'
import MapThumbnailComponent from '../common/MapThumbnailComponent'


class SummaryView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showAll: false
    }

    this.handleShowAll = this.handleShowAll.bind(this);
  }

  handleShowAll() {
    this.setState(prevState => {
      showAll: !prevState.showAll
    });
  }


  render() {

    const startDate = this.props.item.temporalBounding.beginDate
    const endDate = this.props.item.temporalBounding.endDate ? this.props.item.temporalBounding.endDate : 'present'

    return (
      <div>
        <div className={styles.atAGlance}>Collection At A Glance</div>
        <div className={`pure-g`}>
          <div className={`pure-u-1-2`}>
            <div className={styles.sectionHeading}>Time Period: </div>
            <div>{startDate} to {endDate}</div>
            <div className={styles.sectionHeading}>Spatial Bounding: </div>
            {this.renderGeometryOnMap()}
            <div>Coordinates: TODO</div>
            <div className={styles.sectionHeading}>DSMM Rating: </div>
            {this.renderDSMMRating()}
          </div>
          <div className={`pure-u-1-2`}>
            <div className={styles.sectionHeading}>Themes:</div>
            <div className={styles.keywords}>{this.renderGCMDKeywords('gcmdScience', '#008445')}</div>
            <button onClick={()=>{this.handleShowAll()}}>blah</button>
            <div className={styles.sectionHeading}>Instruments:</div>
            <div className={styles.keywords}>{this.renderGCMDKeywords('gcmdInstruments', '#0965a1')}</div>
            <div className={styles.sectionHeading}>Platforms:</div>
            <div className={styles.keywords}>{this.renderGCMDKeywords('gcmdPlatforms', '#008445')}</div>
          </div>
        </div>
      </div>
    )
  }

  renderDSMMRating() {
    const dsmmScore = this.props.item.dsmmAverage
    const fullStars = Math.floor(dsmmScore)
    const halfStar = dsmmScore % 1 >= 0.5

    const stars = []
    if (dsmmScore === 0) {
      stars.push(<span key={42} className={styles.dsmmMissing}>DSMM Rating Unavailable</span>)
    }
    else {
      for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
          stars.push(this.renderFullStar(i))
        }
        else if (i === fullStars && halfStar) {
          stars.push(this.renderHalfStar(i))
        }
        else {
          stars.push(this.renderEmptyStar(i))
        }
      }
    }

    return (
      <div>
        {stars}
        <div className={`${styles.dsmmInfo}`}>
          <img src={infoCircle} className={styles.infoCircle}></img>
          <div className={`${styles.text}`}> This is the average DSMM rating of this collection.
            The <A href="http://doi.org/10.2481/dsj.14-049" target="_blank" title="Data Stewardship Maturity Matrix Information">
              Data Stewardship Maturity Matrix (DSMM)</A> is a unified framework that defines criteria for the following nine components based on measurable practices:
            <ul>
              <li>Accessibility</li>
              <li>Data Integrity</li>
              <li>Data Quality Assessment</li>
              <li>Data Quality Assurance</li>
              <li>Data Quality Control Monitoring</li>
              <li>Preservability</li>
              <li>Production Sustainability</li>
              <li>Transparency Traceability</li>
              <li>Usability</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  renderFullStar(i) {
    return <img key={i} className={styles.star} src={star}></img>
  }

  renderHalfStar(i) {
    return <img key={i} className={styles.star} src={starHalfO}></img>
  }

  renderEmptyStar(i) {
    return <img key={i} className={styles.star} src={starO}></img>
  }

  renderGeometryOnMap() {
    // console.log('geometry', this.props.item.spatialBounding)
    // const imgUrl = processUrl(this.props.item.thumbnail)
    // return imgUrl ?
    //   <img className={styles.previewImg} src={imgUrl}/> :
      return <div className={styles.previewMap}>
        <MapThumbnailComponent geometry={this.props.item.spatialBounding}/>
      </div>
  }

  renderGCMDKeywords(type, bgColor) {
    let keywords = this.props.item && this.props.item[type] || []

    if (!_.isEmpty(keywords)) {
      if (type === 'gcmdScience') {
        keywords = keywords
          .map((k) => k.split('>')) // split GCMD keywords apart
          .reduce((list, keys) => list.concat(keys), []) // flatten
          .map((k) => _.startCase(k.toLowerCase().trim())) // you can figure this one out
          .filter((k, i, a) => a.indexOf(k) === i) // dedupe
      }
      else {
        keywords = keywords
          .map((k) => _.startCase(k.substring(k.indexOf('>') + 1).trim().toLowerCase()) ) // Format is 'SHORT NAME > Long Name' but handles if string doesn't have angle bracket
      }

      return keywords.map( (k, index) => index > 2 && !this.state.showAll ? null : <div className={styles.keyword} style={{backgroundColor: bgColor}} key={k}>{k}</div>  )
    }

    else {
      return <div style={{fontStyle: 'italic', color: bgColor}}>None Provided</div>
    }
  }

}

SummaryView.propTypes = {
  id: PropTypes.string,
  item: PropTypes.object,
}

export default SummaryView