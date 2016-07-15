import React, { PropTypes } from 'react'
import ResultContainer from './ResultContainer'
import styles from './result.css'

const ResultsList = ({results, loading}) => {
  var cards = []
  results.forEach(function(val, key){
    cards.push(<div key={key} className={`${styles['pure-u-1']}
      ${styles['pure-u-md-1-2']} ${styles['pure-u-lg-1-3']}
      ${styles['pure-u-xl-1-4']} ${styles.grid}`}>
      <ResultContainer recordId={key} />
    </div>)
  })
  return <div className={`${styles['pure-g']} ${styles.gridContainer}`}>
    {cards}
  </div>
}

ResultsList.propTypes = {
  results: PropTypes.instanceOf(Object).isRequired
}

ResultsList.defaultProps = {loading: false, results: new Map()}

export default ResultsList
