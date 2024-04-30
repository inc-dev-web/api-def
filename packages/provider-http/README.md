# @api-def/provider-http

This package implements HTTP API provider for `@api-def/core` infrastructure.

## API Definition

### Basic

[Example](/examples/basic.ts)

In order to use the HTTP provider you will first need to create an API:

```ts
const api = createHttpApi({
  baseUrl: 'https://my-api.com',
})
```

`@api-def` doesn't enforce any way the endpoints should be saved. For this example we will use an object to compose endpoints together

```ts
const news = {
  get: api.defineJsonEndpoint<
    void,
    {
      data: object[]
    }
  >({
    method: 'GET',
    url: '/news',
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
```

Then in order to execute the endpoints:

```ts
news.create.execute().then((value) => console.log(value))
news.get.execute().then((value) => console.log(value))
```

Now the logic of HTTP request is abstracted away! Cheers!

### Authentication

Documentation coming soon...

### Going further than JSON requests

Documentation coming soon...

## License

[MIT](/LICENSE)

Copyright (c) 2024-present, Artem Tarasenko
