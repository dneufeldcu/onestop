package org.cedar.onestop.api.search.controller

import groovy.util.logging.Slf4j
import org.cedar.onestop.api.search.service.ElasticsearchService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestAttribute
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController
import groovy.json.JsonOutput
import javax.servlet.http.HttpServletResponse
import javax.servlet.http.HttpServletRequest

import static org.springframework.web.bind.annotation.RequestMethod.GET
import static org.springframework.web.bind.annotation.RequestMethod.HEAD
import static org.springframework.web.bind.annotation.RequestMethod.POST

import java.io.ByteArrayInputStream
import org.apache.commons.io.IOUtils

import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeFormatterBuilder
import java.time.format.ResolverStyle
import java.time.temporal.ChronoField
import java.time.temporal.TemporalAccessor
import java.time.temporal.TemporalQuery
import java.time.ZoneOffset
import java.time.Instant


@Slf4j
@RestController
class SearchController {

  private UiConfig uiConfig
  private ElasticsearchService elasticsearchService

  @Autowired
  public SearchController(ElasticsearchService elasticsearchService, UiConfig uiConfig) {
    this.elasticsearchService = elasticsearchService
    this.uiConfig = uiConfig
  }

  // Get Collection Info
  @RequestMapping(path = "/collection", method = [GET, HEAD], produces = 'application/json')
  Map getCollectionInfo(HttpServletResponse response) {
    return elasticsearchService.totalCollections()
  }

  // GET Collection by ID
  @RequestMapping(path = "/collection/{id}", method = [GET, HEAD], produces = 'application/json')
  Map getCollection(@PathVariable String id, HttpServletResponse response) {
    def result = elasticsearchService.getCollectionById(id)
    if (result.data) {
      response.status = HttpStatus.OK.value()
    }
    else {
      response.status = result.status ?: HttpStatus.BAD_REQUEST.value()
    }
    return result
  }

  // Search Collections
  @RequestMapping(path = "/search/collection", method = [POST, GET])
  Map searchCollections(@RequestBody Map params, HttpServletResponse response) {
    Map validation = JsonValidator.validateSearchRequestSchema(params)
    if (!validation.success) {
      log.debug("invalid request: ${validation.errors.detail?.join(', ')}")
      response.status = HttpStatus.BAD_REQUEST.value()
      return [errors: validation.errors]
    }
    log.info("incoming search params: ${params}")
    return elasticsearchService.searchCollections(params)
  }

  // Get Granule Info
  @RequestMapping(path = "/granule", method = [GET, HEAD], produces = 'application/json')
  Map getGranuleInfo(HttpServletResponse response) {
      return elasticsearchService.totalGranules()
  }

  // GET Granule by ID
  @RequestMapping(path = "/granule/{id}", method = [GET, HEAD], produces = 'application/json')
  Map getGranule(@PathVariable String id, HttpServletResponse response) {
    def result = elasticsearchService.getGranuleById(id)
    if (result.data) {
      response.status = HttpStatus.OK.value()
    }
    else {
      response.status = result.status ?: HttpStatus.BAD_REQUEST.value()
    }
    return result
  }

  // Search Granules
  @RequestMapping(path = "/search/granule", method = [POST, GET])
  Map searchGranules(@RequestBody Map params, HttpServletResponse response) {
    Map validation = JsonValidator.validateSearchRequestSchema(params)
    if (!validation.success) {
      log.debug("invalid request: ${validation.errors.detail?.join(', ')}")
      response.status = HttpStatus.BAD_REQUEST.value()
      return [errors: validation.errors]
    }
    log.info("incoming search params: ${params}")
    return elasticsearchService.searchGranules(params)
  }

  // Get Flattened Granule Info
  @RequestMapping(path = "/flattened-granule", method = [GET, HEAD], produces = 'application/json')
  Map getFlattenedGranuleInfo(HttpServletResponse response) {
    return elasticsearchService.totalFlattenedGranules()
  }

  // GET Flattened Granule by ID
  @RequestMapping(path = "/flattened-granule/{id}", method = [GET, HEAD], produces = 'application/json')
  Map getFlattenedGranule(@PathVariable String id, HttpServletResponse response) {
    def result = elasticsearchService.getFlattenedGranuleById(id)
    if (result.data) {
      response.status = HttpStatus.OK.value()
    }
    else {
      response.status = result.status ?: HttpStatus.BAD_REQUEST.value()
    }
    return result
  }

  // Search Flattened Granules
  @RequestMapping(path = "/search/flattened-granule", method = [POST, GET])
  Map searchFlattenedGranules(@RequestBody Map params, HttpServletResponse response) {
    Map validation = JsonValidator.validateSearchRequestSchema(params)
    if (!validation.success) {
      log.debug("invalid request: ${validation.errors.detail?.join(', ')}")
      response.status = HttpStatus.BAD_REQUEST.value()
      return [errors: validation.errors]
    }
    log.info("incoming search params: ${params}")
    return elasticsearchService.searchFlattenedGranules(params)
  }

  @RequestMapping(path = '/uiConfig', method = GET)
  UiConfig uiConfig() {
    return uiConfig
  }

  @RequestMapping(path = '/sitemap.xml', method = GET)
  void getSitemap( HttpServletRequest request, HttpServletResponse response) {
    def baseUrl = request.getRequestURL().toString().split('api')[0]

    def sitemaps = elasticsearchService.searchSitemap()

    def data = sitemaps.data.collect({site -> """
    <sitemap>

       <loc>${baseUrl}api/sitemap/${site.id}.txt</loc>

       <lastmod>${new Date(site.attributes.lastUpdatedDate).format('yyyy-MM-dd')}</lastmod>


    </sitemap>
    """}).join('\n')

        InputStream myStream = new ByteArrayInputStream( """
    <?xml version="1.0" encoding="UTF-8"?>

    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

      ${data}
    </sitemapindex>

        """.getBytes( ) );

      // Set the content type and attachment header.
      response.addHeader("Content-disposition", "attachment;filename=sitemap.txt");
      response.setContentType("txt/plain");

      // Copy the stream to the response's output stream.
      IOUtils.copy(myStream, response.getOutputStream());
      response.flushBuffer();
  }

  @RequestMapping(path = "/sitemap/{id}.txt", method = [GET, HEAD])
  void getSubSitemap( @PathVariable String id, HttpServletRequest request, HttpServletResponse response
   ) {
    def baseUrl = request.getRequestURL().toString().split('api')[0]
    def result = elasticsearchService.getSitemapById(id)

    if (result.data) {
      response.status = HttpStatus.OK.value()
      def data = result.data[0].attributes.content.collect({collectionId -> "${baseUrl}#/collections/details/${collectionId}"}).join('\n') // This only works when request comes through client, not curl, etc... (unless the base path happens to be the same)
        InputStream myStream = new ByteArrayInputStream(
          data.getBytes()
        );

      // Set the content type and attachment header.
      response.addHeader("Content-disposition", "attachment;filename=${id}.txt");
      response.setContentType("txt/plain");

      // Copy the stream to the response's output stream.
      IOUtils.copy(myStream, response.getOutputStream());
      response.flushBuffer();
    }
    else {
      response.status = result.status ?: HttpStatus.BAD_REQUEST.value()
    }
  }
}
