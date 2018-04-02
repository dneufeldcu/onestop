import React from 'react'
import PropTypes from 'prop-types'
import MapThumbnail from '../../common/MapThumbnail'
import {processUrl} from '../../utils/urlUtils'
import * as util from '../../utils/resultUtils'
import FlexColumn from '../../common/FlexColumn'
import FlexRow from '../../common/FlexRow'
import {boxShadow} from '../../common/defaultStyles'
import A from '../../common/link/Link'

const styleResult = {
  minHeight: '15.5em',
  margin: '0 1.618em 1.618em 0',
  boxShadow: boxShadow,
  backgroundColor: 'white',
  transition: '0.3s background-color ease',
}

const styleResultFocus = {
  backgroundColor: 'rgb(140, 185, 216)',
}

const styleImageContainer = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const styleImage = {
  width: '100%',
  height: '15.5em',
}

const styleMap = {
  width: '100%',
  height: '15.5em',
}

const styleTitle = {
  fontSize: '1.5em',
  color: 'rgb(0, 0, 50)',
  margin: '0 0 0.618em 0',
}

const styleSectionHeader = {
  fontSize: '1.25em',
  margin: '0.25em 0',
}

const styleBadgeLayout = {
  display: 'flex',
  flexFlow: 'row wrap',
}

class ListResult extends React.Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.setState({
      focusing: false,
    })
  }

  renderDisplayImage(thumbnail, geometry) {
    const imgUrl = processUrl(thumbnail)
    if (imgUrl && !imgUrl.includes('maps.googleapis.com')) {
      // Stick to leaflet maps
      return (
        <div key={'ListResult::image'} style={styleImageContainer}>
          <img
            style={styleImage}
            src={imgUrl}
            alt="Result Image"
            aria-hidden="true"
          />
        </div>
      )
    }
    else {
      // Return map image of spatial bounding or, if none, world map
      return (
        <div key={'ListResult::map'} style={styleMap}>
          <MapThumbnail geometry={geometry} interactive={true} />
        </div>
      )
    }
  }

  renderTimeAndSpaceString(
    beginDate,
    beginYear,
    endDate,
    endYear,
    spatialBounding
  ) {
    return (
      <div key={'ListResult::timeAndSpace'}>
        <h3 style={styleSectionHeader}>Time Period:</h3>
        <div>
          {util.buildTimePeriodString(beginDate, beginYear, endDate, endYear)}
        </div>
        <h3 style={styleSectionHeader}>Bounding Coordinates:</h3>
        <div>{util.buildCoordinatesString(spatialBounding)}</div>
      </div>
    )
  }

  renderBadge = ({protocol, url, displayName}) => {
    const linkText = displayName ? displayName : protocol.label
    return (
      <li key={`accessLink::${url}`} style={util.styleProtocolListItem}>
        <A
          href={url}
          key={url}
          title={url}
          target="_blank"
          style={{textDecoration: 'none', display: 'inline-flex'}}
        >
          <div style={util.styleBadge(protocol)}>
            {util.renderBadgeIcon(protocol)}
          </div>
          <div
            style={{
              ...util.styleProtocolListLabel,
              ...{textDecoration: 'underline'},
            }}
          >
            {linkText}
          </div>
        </A>
      </li>
    )
  }

  renderLinks(links) {
    const badges = _.chain(links)
      // .filter(link => link.linkFunction.toLowerCase() === 'download' || link.linkFunction.toLowerCase() === 'fileaccess')
      .map(link => ({
        protocol: util.identifyProtocol(link),
        url: link.linkUrl,
        displayName: link.linkName
          ? link.linkName
          : link.linkDescription ? link.linkDescription : null,
      }))
      .sortBy(info => info.protocol.id)
      .map(this.renderBadge.bind(this))
      .value()

    const badgesElement = _.isEmpty(badges) ? (
      <div>N/A</div>
    ) : (
      <div style={styleBadgeLayout}>{badges}</div>
    )

    return (
      <div key={'ListResult::accessLinks'}>
        <h3 style={styleSectionHeader}>Data Access Links:</h3>
        <ul style={util.styleProtocolList}>{badgesElement}</ul>
      </div>
    )
  }

  handleFocus = event => {
    this.setState({
      focusing: true,
    })
  }

  handleBlur = event => {
    this.setState({
      focusing: false,
    })
  }

  render() {
    const {item, showLinks, showTimeAndSpace} = this.props
    const rightItems = [
      <h2 key={'ListResult::title'} style={styleTitle}>
        {item.title}
      </h2>,
    ]

    if (showLinks) {
      rightItems.push(this.renderLinks(item.links))
    }
    if (showTimeAndSpace) {
      rightItems.push(
        this.renderTimeAndSpaceString(
          item.beginDate,
          item.beginYear,
          item.endDate,
          item.endYear,
          item.spatialBounding
        )
      )
    }

    const left = (
      <FlexColumn
        key={'ListResult::leftColumn'}
        style={{width: '32%'}}
        items={[
          this.renderDisplayImage(item.thumbnail, item.spatialBounding),
        ]}
      />
    )
    const right = (
      <FlexColumn
        key={'ListResult::rightColumn'}
        style={{marginLeft: '1.618em', width: '68%'}}
        items={rightItems}
      />
    )

    const styleResultMerged = {
      ...styleResult,
      ...(this.state.focusing ? styleResultFocus : {}),
    }

    return (
      <div
        style={styleResultMerged}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
      >
        <FlexRow style={{padding: '1.618em'}} items={[ left, right ]} />
      </div>
    )
  }
}

ListResult.propTypes = {
  item: PropTypes.object.isRequired,
  showLinks: PropTypes.bool.isRequired,
  showTimeAndSpace: PropTypes.bool.isRequired,
}

export default ListResult
