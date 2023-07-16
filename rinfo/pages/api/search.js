import fetch from 'node-fetch'

const defaultEndpoint = 'https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=5e7653c1a566d6d9&format=json&large_area=Z011'

export default async (req, res) => {
    let url = defaultEndpoint
  
    if (typeof req.query.start !== undefined) {
      url = `${url}&start=${req.query.start}`
    }
  }