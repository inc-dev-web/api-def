/* eslint-disable no-console */
import { createHttpApi } from '@api-def/provider-http'

const api = createHttpApi({
  baseUrl: 'https://my-api.com',
})

const news = {
  get: api.defineJsonEndpoint<
    void,
    {
      data: object[]
    }
  >({
    method: 'GET',
    url: '',
    output: 'naive',
  }),
  create: api.defineJsonEndpoint<
    {
      title: string
      content: string
    },
    {
      data: object
    }
  >({
    method: 'POST',
    url: '/news',
    output: 'naive',
  }),
}

news.get.execute().then((value) => console.log(value))
