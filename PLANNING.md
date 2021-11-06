# Planning document

## 2021-11-06 13:11:34

* Commit workers.dev example code 
* Put API key in secrets

* CircleCI build to deploy to workers.dev

* Use `ittyrouter` to make code more practical
  * e.g. somewhat mirror upstream API structure, params like /stops/:stopID
  * .txt for summary (e.g. usable pre-frontend), .json for full data structure
* Implement /stops endpoint

* Add next frontend
  * on CI `next export` hello world to cloudflare pages
* Implement "pick a stop" on frontend
  * show router works with next export e.g. it goes to /stop/AP 
* Implement "stop info" frontend page
  * e.g. list of scheduled trains (use date-fns to format), platform info
    * grey/shaded if no platform info
    * black if platform info
    * red if adjustment

* Register whichtrack.ca via cloudflare domains
  * Set up BE/worker at api.whichtrack.ca
  * set up FE at whichtrack.ca root domain 

* Implement Cloudflare cache
  * 24h for things like "list all stops" e.g. lat/lngs
  * 15s for things like platform info/predictions
