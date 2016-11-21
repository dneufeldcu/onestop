import React, { PropTypes } from 'react'
import Breadcrumbs from 'react-breadcrumbs'
import styles from './resultLayout.css'
import FacetContainer from '../search/facet/FacetContainer'

class ResultLayout extends React.Component {
  constructor(props) {
    super(props)

    this.toggleFacetMenu = this.toggleFacetMenu.bind(this)
    this.renderFacetMenu = this.renderFacetMenu.bind(this)
    this.renderFacetButton = this.renderFacetButton.bind(this)
    this.facetButtonImage = this.facetButtonImage.bind(this)
    this.renderResultsContainer = this.renderResultsContainer.bind(this)

    this.location = props.location.pathname
    this.collapseFacetMenu = false
  }

  componentWillUpdate(nextProps) {
    this.location = nextProps.location.pathname
  }

  toggleFacetMenu() {
    this.collapseFacetMenu = !this.collapseFacetMenu
    this.forceUpdate()
  }

  renderFacetMenu() {
    if(this.location.includes("granules") || this.collapseFacetMenu) {
      return <div display="none"></div>
    }
    else {
      return <div className={`pure-u-10-24 pure-u-md-7-24 pure-u-lg-5-24 ${styles.facetSideBar}`}>
        <FacetContainer/>
      </div>
    }
  }

  renderFacetButton() {
    if(this.location.includes("granules")) {
      return <div display="none"></div>
    }
    else {
      return <div className={"pure-u-1-24"}>
        <button id="facetButton" className={`pure-button ${styles.facetButton}`} onClick={this.toggleFacetMenu}>
          <i className={`${this.facetButtonImage()}`}></i>
        </button>
      </div>
    }
  }

  facetButtonImage() {
    if(this.collapseFacetMenu) {
      return "fa fa-arrow-right"
    }
    else {
      return "fa fa-arrow-left"
    }
  }

  renderResultsContainer() {
    if(this.location.includes("granules") || this.collapseFacetMenu) {
      return "pure-u-22-24"
    }
    else {
      return "pure-u-12-24 pure-u-md-15-24 pure-u-lg-17-24"
    }
  }

  render() {
    return <div id="layout" className={`pure-g ${styles.mainWindow}`}>
      {this.renderFacetMenu()}
      {this.renderFacetButton()}
      <div className={`${this.renderResultsContainer()} ${styles.resultsContainer}`}>
        <div className={styles.breadCrumbs}>
          <Breadcrumbs routes={this.props.routes} params={this.props.params}/>
        </div>
        {this.props.children}
      </div>
    </div>
  }
}

export default ResultLayout