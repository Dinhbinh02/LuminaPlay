# Collection
# Images

Get the images that belong to a collection.

This method will return the backdrops and posters that have been added to a collection.

> 📘 Note
>
> If you have a `language` specified, it will act as a filter on the returned items. You can use the `include_image_language` param to query additional languages.

# OpenAPI definition

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "tmdb-api",
    "version": "3"
  },
  "servers": [
    {
      "url": "https://api.themoviedb.org"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "apiKey",
        "in": "header",
        "name": "Authorization",
        "x-bearer-format": "bearer"
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/3/collection/{collection_id}/images": {
      "get": {
        "summary": "Images",
        "description": "Get the images that belong to a collection.",
        "operationId": "collection-images",
        "parameters": [
          {
            "name": "collection_id",
            "in": "path",
            "schema": {
              "type": "integer",
              "format": "int32"
            },
            "required": true
          },
          {
            "name": "include_image_language",
            "in": "query",
            "description": "specify a comma separated list of ISO-639-1 values to query, for example: `en-US,null`",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "language",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\"id\":10,\"backdrops\":[{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/d8duYyyC9J5T825Hg7grmaabfxQ.jpg\",\"vote_average\":5.464,\"vote_count\":30,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":720,\"iso_639_1\":null,\"file_path\":\"/zZDkgOmFMVYpGAkR9Tkxw0CRnxX.jpg\",\"vote_average\":5.454,\"vote_count\":3,\"width\":1280},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/trf3Hi3tPOJARsCBoVMDBlpjPC4.jpg\",\"vote_average\":5.376,\"vote_count\":6,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/sGxcMvC6mfCzEir0c1tldsPhZEF.jpg\",\"vote_average\":5.356,\"vote_count\":22,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/h3JDR9iruHqwGC4Dm8UbYkY9paK.jpg\",\"vote_average\":5.326,\"vote_count\":7,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":2160,\"iso_639_1\":null,\"file_path\":\"/eO3PyZbDe7UlkyypMgfHWdeo9VZ.jpg\",\"vote_average\":5.322,\"vote_count\":5,\"width\":3840},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/benqmUIQGqU7iMYrDl8aUxhXWC.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":2160,\"iso_639_1\":null,\"file_path\":\"/5PqKzRkcPZOsKy1sqAC8IrYkeyc.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":3840},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/itH1Wlzwf6yTNa7fVkYMVUwXlhR.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":720,\"iso_639_1\":null,\"file_path\":\"/qCECROwx3TRUEgoZv2Mz2D723QC.jpg\",\"vote_average\":5.312,\"vote_count\":8,\"width\":1280},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/vusuae67ukSLazTnR5Ab8uUZ0dj.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/noKFlPn2GjuUounuxtmPnkRlZpa.jpg\",\"vote_average\":5.266,\"vote_count\":6,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/e9mh9iqVxhon2Y7pkLZ7zItUWHX.jpg\",\"vote_average\":5.266,\"vote_count\":5,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":2160,\"iso_639_1\":null,\"file_path\":\"/iY2ujEY2m68OTTlPFTiHub9joHS.jpg\",\"vote_average\":5.264,\"vote_count\":8,\"width\":3840},{\"aspect_ratio\":1.779,\"height\":2021,\"iso_639_1\":null,\"file_path\":\"/4z9ijhgEthfRHShoOvMaBlpciXS.jpg\",\"vote_average\":5.258,\"vote_count\":6,\"width\":3596},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/n9NcXAZIurCo9RHvMahOCT244rF.jpg\",\"vote_average\":5.252,\"vote_count\":4,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/9RykAYGe1wbygBAmqNhhtCj99ss.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/bMPfIfBZOUv7c357J8HliYJfpca.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/e2XZ6rbBFYqWB5n5na4GCjljfDM.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":720,\"iso_639_1\":null,\"file_path\":\"/3XwvVWP33yWOqwVlJCSZWC1Uy58.jpg\",\"vote_average\":5.244,\"vote_count\":9,\"width\":1280},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/qVPChlozQ1BP3svfHjiAdNneMGA.jpg\",\"vote_average\":5.244,\"vote_count\":9,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/gTwXUbylwCBNedCSNrOVKZzLTT8.jpg\",\"vote_average\":5.19,\"vote_count\":5,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/osBSTziJWBaXbK0eTpNnPb5eIi4.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/rgjAb1oUCzJk1U2WhtQt7gGu84U.jpg\",\"vote_average\":5.14,\"vote_count\":10,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/uyFHjhN8McyCy9EPaO1MsS3CydT.jpg\",\"vote_average\":5.106,\"vote_count\":2,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/oGf9FeB8coLGYVp3SMHjAR809Lv.jpg\",\"vote_average\":4.962,\"vote_count\":11,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"it\",\"file_path\":\"/ojMAbHNL0VBXiV2oQpROJ6Xx827.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"pt\",\"file_path\":\"/ezt8TqHdwbs1iJhp3PTURDZ3hkh.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":2160,\"iso_639_1\":\"en\",\"file_path\":\"/kIL3Me1fuwPqYvE26N47bQuLz4a.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":3840},{\"aspect_ratio\":1.778,\"height\":2160,\"iso_639_1\":\"de\",\"file_path\":\"/wRrpzewue8QqBYcaIDCHcOFgyGT.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":3840},{\"aspect_ratio\":1.778,\"height\":2160,\"iso_639_1\":null,\"file_path\":\"/jci0IkGpJRwpTx62jDxIFXAt2Sr.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":3840},{\"aspect_ratio\":1.778,\"height\":1440,\"iso_639_1\":null,\"file_path\":\"/5T9HNK6EZc0OlFmr6MWfFRse4l8.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2560},{\"aspect_ratio\":1.781,\"height\":842,\"iso_639_1\":\"en\",\"file_path\":\"/6hMN4oospeDItQlACbAWkjI7nC9.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1500}],\"posters\":[{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/r8Ph5MYXL04Qzu4QBbq2KjqwtkQ.jpg\",\"vote_average\":5.516,\"vote_count\":14,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pt\",\"file_path\":\"/suaJuFprbgdZaTE0mOt0xWIGFyQ.jpg\",\"vote_average\":5.454,\"vote_count\":3,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/gq5Wi7i4SF3lo4HHkJasDV95xI9.jpg\",\"vote_average\":5.444,\"vote_count\":25,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/bYbHqvRANCpuRTs0RAu10LhmVKU.jpg\",\"vote_average\":5.392,\"vote_count\":8,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/22dj38IckjzEEUZwN1tPU5VJ1qq.jpg\",\"vote_average\":5.39,\"vote_count\":6,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/tdQzRSk4PXX6hzjLcQWHafYtZTI.jpg\",\"vote_average\":5.388,\"vote_count\":4,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pl\",\"file_path\":\"/gbaFVZMVL0nUhZLmX3TWNZj8ydE.jpg\",\"vote_average\":5.384,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/btVpLbQCNE8mDTRrb6Llk5B5pGr.jpg\",\"vote_average\":5.334,\"vote_count\":11,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":2529,\"iso_639_1\":\"en\",\"file_path\":\"/pWVLFh4OuejTpUaDQbB1C4zoS2p.jpg\",\"vote_average\":5.33,\"vote_count\":9,\"width\":1686},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/aSrMJYmQX8kpF26LijkCsYhBMvm.jpg\",\"vote_average\":5.322,\"vote_count\":5,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/ww4rH6EQ3610fBNuZBdIL9hSYkE.jpg\",\"vote_average\":5.322,\"vote_count\":5,\"width\":2000},{\"aspect_ratio\":0.666,\"height\":1426,\"iso_639_1\":\"ru\",\"file_path\":\"/8X3WoKnDw9r7SIvM5vx0mpnb2yZ.jpg\",\"vote_average\":5.322,\"vote_count\":5,\"width\":950},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"fr\",\"file_path\":\"/6mHkagjziBPth2Mx0VpEercocm4.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/8Li4KawpEa5i2gm5gFSBKmEFtvy.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pt\",\"file_path\":\"/fI9R8fkW21fv0HDrwNnM3PZhgN.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"ru\",\"file_path\":\"/y6kKwGLCCy3MMbBdUnxB3afIfsd.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":2529,\"iso_639_1\":\"en\",\"file_path\":\"/xFnzs2hjiWBgv46XnCdBUToBKED.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":1686},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pl\",\"file_path\":\"/4QfUvGMaSMoItapTeg51Knf1PiF.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/rG8P8pPUDSm02VW3cKtivca4rqE.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/jGNtfNeFRmJBIwL1exFteZhedOr.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":2000},{\"aspect_ratio\":0.666,\"height\":1000,\"iso_639_1\":\"es\",\"file_path\":\"/qJNGWrKB3Bnshc1iuedpxXbVQMe.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":666},{\"aspect_ratio\":0.667,\"height\":2250,\"iso_639_1\":\"sk\",\"file_path\":\"/ojQvEl8rFqJWYIATlDCUtxa1TeV.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1500},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/fByDz2DSFKR8jugyApmHFUQF1pq.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/oFgwvpoPi2Ixcg3YLxQpYhoH1Jm.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/9cSsr4dqTSqSlUOsbufco2YRrZQ.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/l9cWYWFwRZNdw0r2gesdDyXTbGx.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/sqYlJCjwdbhxlhbOVK9iMLYUZIF.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/qhEimz49g0r2sQ06Xfb8Hxmfk3T.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.666,\"height\":3000,\"iso_639_1\":\"uk\",\"file_path\":\"/hU6FebQXRKu0bd0VMNa8mTal8Eh.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1999},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/cEHz2gnXYZuqNGc8hAy35VgIvbT.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/drr5Td2aWuUR23ckuSOP6DhXBGL.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":750,\"iso_639_1\":\"fr\",\"file_path\":\"/ufEdffeQOl8oTDHrBh34cDZtuZl.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":500},{\"aspect_ratio\":0.667,\"height\":750,\"iso_639_1\":\"fr\",\"file_path\":\"/ikiFMVGhCePycr7MQQd8FufPh1F.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":500},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/vKeB6QYgi0b7VHHmeJ8JZzC99K8.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/mLRwi2OQZWT58tOH83ysZWMnhUN.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/hf10Oz89bIyrtjKraH849ZCQliM.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/10rGm5WQpXclsqr2T8SFLYWMI0Q.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"el\",\"file_path\":\"/kX5kXDAemzVv7yHezufeHDDGHkl.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/mEpQbsUSekbQRdffXMeQWjeHb34.jpg\",\"vote_average\":5.31,\"vote_count\":24,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/iTQHKziZy9pAAY4hHEDCGPaOvFC.jpg\",\"vote_average\":5.296,\"vote_count\":20,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/bLPTI0236VjeBhcycu2wUwNSXGv.jpg\",\"vote_average\":5.276,\"vote_count\":12,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/z37SuzzQZawvdBmtYcQWxriQmCK.jpg\",\"vote_average\":5.27,\"vote_count\":10,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":2100,\"iso_639_1\":\"en\",\"file_path\":\"/drJ1vvVlwr5bmH9ssOl1m37q3Lc.jpg\",\"vote_average\":5.258,\"vote_count\":6,\"width\":1400},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/lYFNh6yeYWTPgg0qvnZMKKA8RS1.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pt\",\"file_path\":\"/v3e56rck9tv8zeMuNldJdtpgFeQ.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/dcVdgUBO8lpuKpH7GzeyeqjSO0l.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"ru\",\"file_path\":\"/wRBGET9QNCOQJY55yAA1ZyF6cCb.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pt\",\"file_path\":\"/t2sABFPr9ft0bJ6XYdhCPsfooCd.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.701,\"height\":1426,\"iso_639_1\":\"es\",\"file_path\":\"/tGKRoZprIpJXFNvOtWu93KfWYIk.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"de\",\"file_path\":\"/46oFAcjORMltwPxR6uU6hM4mN7F.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"de\",\"file_path\":\"/5gmlZYd76FPrc8zLNVDEDVQL9fh.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/wCRLEnMHmMLiQ6ixs8lbggLeNq4.jpg\",\"vote_average\":5.238,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/aLDdG5e3c2qNMcWzlxAnW15okOr.jpg\",\"vote_average\":5.226,\"vote_count\":10,\"width\":1000},{\"aspect_ratio\":0.681,\"height\":1240,\"iso_639_1\":\"fr\",\"file_path\":\"/jVTIJ33eGKja0SfI40ntASPBmnw.jpg\",\"vote_average\":5.224,\"vote_count\":4,\"width\":844},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"es\",\"file_path\":\"/7TOaabZ4TFqtn8cD1Jw1G7ycgSs.jpg\",\"vote_average\":5.202,\"vote_count\":2,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"es\",\"file_path\":\"/zwFQlQZYf6Zh6FncP76okjFZZfh.jpg\",\"vote_average\":5.202,\"vote_count\":2,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"de\",\"file_path\":\"/fYWbvEBCLHWPHo0QZt6o7dKBSLP.jpg\",\"vote_average\":5.198,\"vote_count\":7,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/kVstTGhkSsILxxIUYIEGmlaYTFe.jpg\",\"vote_average\":5.182,\"vote_count\":5,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/k6SPwdWi1m3p2JhoYn2KhRgZgEx.jpg\",\"vote_average\":5.18,\"vote_count\":3,\"width\":2000},{\"aspect_ratio\":0.666,\"height\":997,\"iso_639_1\":\"uk\",\"file_path\":\"/juoqZnVARJhZn5UjRodl6rVHXHY.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":664},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"ru\",\"file_path\":\"/58CAUPUgoTTA1LuesMrM5CbpcuW.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"ru\",\"file_path\":\"/defdE4jKZSBJ4DxdmOtYnLz8Qj7.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"it\",\"file_path\":\"/lBdOIyD5rOJA34qiDi3yrZqdbg7.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"pt\",\"file_path\":\"/pKLFj7UNEcsRJxV69xmq6BB2i9s.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"sk\",\"file_path\":\"/t06usnuvImXwTa92SHoAkMEn8v2.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"sk\",\"file_path\":\"/y8T6UdWBPSG878n2sZiddx9vWER.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"sk\",\"file_path\":\"/aWxzsGF7PaZKR77F7SXkTc6npP1.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/xAwL3ySFqWHYjpqXlQQXcbWCoII.jpg\",\"vote_average\":5.128,\"vote_count\":6,\"width\":1000},{\"aspect_ratio\":0.715,\"height\":1437,\"iso_639_1\":\"ru\",\"file_path\":\"/me843ySolO7vwJqQcJ6OUbcRM3H.jpg\",\"vote_average\":5.118,\"vote_count\":4,\"width\":1027},{\"aspect_ratio\":0.701,\"height\":1426,\"iso_639_1\":\"fr\",\"file_path\":\"/4B4OwAiu0xhOLI0p1AWBifG3qPE.jpg\",\"vote_average\":5.118,\"vote_count\":4,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/4gsn3sBxH3Owx1Id7lTYkW52524.jpg\",\"vote_average\":5.118,\"vote_count\":4,\"width\":1000},{\"aspect_ratio\":0.75,\"height\":1200,\"iso_639_1\":\"fr\",\"file_path\":\"/mWAfAZVaw9mOOFEpaPwJHRENPza.jpg\",\"vote_average\":5.072,\"vote_count\":9,\"width\":900},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/xwsYa1wA9EB9ibW1stJZpqHznKY.jpg\",\"vote_average\":5.058,\"vote_count\":6,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/dLBoWkfIbEQRAYiXdB2uMXAqFoT.jpg\",\"vote_average\":5.056,\"vote_count\":5,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/y6oGacKFP025f0PVwG94X60jjQS.jpg\",\"vote_average\":5.054,\"vote_count\":15,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/klv4rvIxnyJcZAI3DFvW5gHTSpM.jpg\",\"vote_average\":5.004,\"vote_count\":10,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"hu\",\"file_path\":\"/qgnOC2T0kmxWOS32SKGsbtxSvN6.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.664,\"height\":1084,\"iso_639_1\":\"en\",\"file_path\":\"/gZPLydtYmniGwP4zoxTnP47yWnu.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":720},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/6EvyuI0XpL7JopXTE72FsgM5d47.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/3JacSFXvk9AbCjz0nTdHMkDwTTH.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pl\",\"file_path\":\"/18ticQ3bpUUGZGCR3pGglrz7ly0.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pl\",\"file_path\":\"/hCxhxuc5or4ZKtiwQDmWBUN7Xbr.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.701,\"height\":1426,\"iso_639_1\":\"en\",\"file_path\":\"/vGkiaAWM6B0bFyz2aW3fSRSM8cH.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":2100,\"iso_639_1\":\"en\",\"file_path\":\"/oG2xkP2Kwkrn3C8dyqyRXMOEx50.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1400},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pl\",\"file_path\":\"/pYOArjBUvtPBsuWTIE58lQTrDwn.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"ru\",\"file_path\":\"/ajd1f8pX1JcYZBrxbAVm3l53TJ7.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.675,\"height\":1481,\"iso_639_1\":\"en\",\"file_path\":\"/lGM4SPc5MtQDUTz6M18aVTEjy7Y.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":2400,\"iso_639_1\":\"en\",\"file_path\":\"/q2FanXsFtdrOsrGplVtOg7oFrc3.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1600},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/8EjZLn7SZ9fG6l2anOJwB8u6prb.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.71,\"height\":2818,\"iso_639_1\":null,\"file_path\":\"/1U4s6OoPoVScNh2xFNfzLMGDu59.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/27d091mfAQ7PJ0TrZaglWPzm0va.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"es\",\"file_path\":\"/v4dUG5ujNR63UbEDfSDZ3KaINlh.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/nf3N6GphVFJCTUdlb4nQyxgFk7T.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"he\",\"file_path\":\"/yvQdymDQiTYHLsE7qv41liZ7auy.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/zVEJCIguJkxSFaQZSSFMq6l2Vq3.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/sJ0zFbzrTAG3riisqLuhF8WcM45.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/mWU0DuJtl2bOno6kwXs3HZ3abwC.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/9m4sVAYCZcxdJR3D4xAbLZE7PuE.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"fr\",\"file_path\":\"/7s98is4MxeDVCxIVrAsfrr50dMm.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"cs\",\"file_path\":\"/y2SNPwLT9zdZjJQRVX7T5u8mko7.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"cs\",\"file_path\":\"/z9QaA7oszDSY0jLgv0mDkYF7u8M.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.666,\"height\":2437,\"iso_639_1\":\"en\",\"file_path\":\"/knhIHcaUdLExfdksyvcIEssbJzT.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1624},{\"aspect_ratio\":0.666,\"height\":2437,\"iso_639_1\":\"en\",\"file_path\":\"/nH3TpzQOPtnqauB8kntTnljBIns.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1624},{\"aspect_ratio\":0.666,\"height\":2437,\"iso_639_1\":\"en\",\"file_path\":\"/4b3V0P5hpUHTM8ggfQQFFqKe5lc.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1624},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"fr\",\"file_path\":\"/hpwpPOuuAuSadR2BNSKKAz9aD9O.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.666,\"height\":1762,\"iso_639_1\":\"en\",\"file_path\":\"/p8PPWEfm30i9pIcbu5fXQBcTi5L.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1174},{\"aspect_ratio\":0.667,\"height\":2250,\"iso_639_1\":\"en\",\"file_path\":\"/bH5tGEuQexH0bt4ruobaquxv7U4.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1500},{\"aspect_ratio\":0.711,\"height\":750,\"iso_639_1\":\"el\",\"file_path\":\"/j0m8uIWawPibEAzYdlf0t7GRzJs.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":533},{\"aspect_ratio\":0.667,\"height\":1024,\"iso_639_1\":null,\"file_path\":\"/6Rj64rPRrzoN0Dm7UQdW36YwuIi.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":683}]}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "id": {
                      "type": "integer",
                      "example": 10,
                      "default": 0
                    },
                    "backdrops": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "aspect_ratio": {
                            "type": "number",
                            "example": 1.778,
                            "default": 0
                          },
                          "height": {
                            "type": "integer",
                            "example": 1080,
                            "default": 0
                          },
                          "iso_639_1": {},
                          "file_path": {
                            "type": "string",
                            "example": "/d8duYyyC9J5T825Hg7grmaabfxQ.jpg"
                          },
                          "vote_average": {
                            "type": "number",
                            "example": 5.464,
                            "default": 0
                          },
                          "vote_count": {
                            "type": "integer",
                            "example": 30,
                            "default": 0
                          },
                          "width": {
                            "type": "integer",
                            "example": 1920,
                            "default": 0
                          }
                        }
                      }
                    },
                    "posters": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "aspect_ratio": {
                            "type": "number",
                            "example": 0.667,
                            "default": 0
                          },
                          "height": {
                            "type": "integer",
                            "example": 3000,
                            "default": 0
                          },
                          "iso_639_1": {
                            "type": "string",
                            "example": "en"
                          },
                          "file_path": {
                            "type": "string",
                            "example": "/r8Ph5MYXL04Qzu4QBbq2KjqwtkQ.jpg"
                          },
                          "vote_average": {
                            "type": "number",
                            "example": 5.516,
                            "default": 0
                          },
                          "vote_count": {
                            "type": "integer",
                            "example": 14,
                            "default": 0
                          },
                          "width": {
                            "type": "integer",
                            "example": 2000,
                            "default": 0
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "deprecated": false
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true
}
```

# Company
Images

# Images

Get the images that belong to a collection.

This method will return the backdrops and posters that have been added to a collection.

> 📘 Note
>
> If you have a `language` specified, it will act as a filter on the returned items. You can use the `include_image_language` param to query additional languages.

# OpenAPI definition

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "tmdb-api",
    "version": "3"
  },
  "servers": [
    {
      "url": "https://api.themoviedb.org"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "apiKey",
        "in": "header",
        "name": "Authorization",
        "x-bearer-format": "bearer"
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/3/collection/{collection_id}/images": {
      "get": {
        "summary": "Images",
        "description": "Get the images that belong to a collection.",
        "operationId": "collection-images",
        "parameters": [
          {
            "name": "collection_id",
            "in": "path",
            "schema": {
              "type": "integer",
              "format": "int32"
            },
            "required": true
          },
          {
            "name": "include_image_language",
            "in": "query",
            "description": "specify a comma separated list of ISO-639-1 values to query, for example: `en-US,null`",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "language",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\"id\":10,\"backdrops\":[{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/d8duYyyC9J5T825Hg7grmaabfxQ.jpg\",\"vote_average\":5.464,\"vote_count\":30,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":720,\"iso_639_1\":null,\"file_path\":\"/zZDkgOmFMVYpGAkR9Tkxw0CRnxX.jpg\",\"vote_average\":5.454,\"vote_count\":3,\"width\":1280},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/trf3Hi3tPOJARsCBoVMDBlpjPC4.jpg\",\"vote_average\":5.376,\"vote_count\":6,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/sGxcMvC6mfCzEir0c1tldsPhZEF.jpg\",\"vote_average\":5.356,\"vote_count\":22,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/h3JDR9iruHqwGC4Dm8UbYkY9paK.jpg\",\"vote_average\":5.326,\"vote_count\":7,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":2160,\"iso_639_1\":null,\"file_path\":\"/eO3PyZbDe7UlkyypMgfHWdeo9VZ.jpg\",\"vote_average\":5.322,\"vote_count\":5,\"width\":3840},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/benqmUIQGqU7iMYrDl8aUxhXWC.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":2160,\"iso_639_1\":null,\"file_path\":\"/5PqKzRkcPZOsKy1sqAC8IrYkeyc.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":3840},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/itH1Wlzwf6yTNa7fVkYMVUwXlhR.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":720,\"iso_639_1\":null,\"file_path\":\"/qCECROwx3TRUEgoZv2Mz2D723QC.jpg\",\"vote_average\":5.312,\"vote_count\":8,\"width\":1280},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/vusuae67ukSLazTnR5Ab8uUZ0dj.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/noKFlPn2GjuUounuxtmPnkRlZpa.jpg\",\"vote_average\":5.266,\"vote_count\":6,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/e9mh9iqVxhon2Y7pkLZ7zItUWHX.jpg\",\"vote_average\":5.266,\"vote_count\":5,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":2160,\"iso_639_1\":null,\"file_path\":\"/iY2ujEY2m68OTTlPFTiHub9joHS.jpg\",\"vote_average\":5.264,\"vote_count\":8,\"width\":3840},{\"aspect_ratio\":1.779,\"height\":2021,\"iso_639_1\":null,\"file_path\":\"/4z9ijhgEthfRHShoOvMaBlpciXS.jpg\",\"vote_average\":5.258,\"vote_count\":6,\"width\":3596},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/n9NcXAZIurCo9RHvMahOCT244rF.jpg\",\"vote_average\":5.252,\"vote_count\":4,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/9RykAYGe1wbygBAmqNhhtCj99ss.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/bMPfIfBZOUv7c357J8HliYJfpca.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/e2XZ6rbBFYqWB5n5na4GCjljfDM.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":720,\"iso_639_1\":null,\"file_path\":\"/3XwvVWP33yWOqwVlJCSZWC1Uy58.jpg\",\"vote_average\":5.244,\"vote_count\":9,\"width\":1280},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/qVPChlozQ1BP3svfHjiAdNneMGA.jpg\",\"vote_average\":5.244,\"vote_count\":9,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/gTwXUbylwCBNedCSNrOVKZzLTT8.jpg\",\"vote_average\":5.19,\"vote_count\":5,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/osBSTziJWBaXbK0eTpNnPb5eIi4.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/rgjAb1oUCzJk1U2WhtQt7gGu84U.jpg\",\"vote_average\":5.14,\"vote_count\":10,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/uyFHjhN8McyCy9EPaO1MsS3CydT.jpg\",\"vote_average\":5.106,\"vote_count\":2,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/oGf9FeB8coLGYVp3SMHjAR809Lv.jpg\",\"vote_average\":4.962,\"vote_count\":11,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"it\",\"file_path\":\"/ojMAbHNL0VBXiV2oQpROJ6Xx827.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"pt\",\"file_path\":\"/ezt8TqHdwbs1iJhp3PTURDZ3hkh.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":2160,\"iso_639_1\":\"en\",\"file_path\":\"/kIL3Me1fuwPqYvE26N47bQuLz4a.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":3840},{\"aspect_ratio\":1.778,\"height\":2160,\"iso_639_1\":\"de\",\"file_path\":\"/wRrpzewue8QqBYcaIDCHcOFgyGT.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":3840},{\"aspect_ratio\":1.778,\"height\":2160,\"iso_639_1\":null,\"file_path\":\"/jci0IkGpJRwpTx62jDxIFXAt2Sr.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":3840},{\"aspect_ratio\":1.778,\"height\":1440,\"iso_639_1\":null,\"file_path\":\"/5T9HNK6EZc0OlFmr6MWfFRse4l8.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2560},{\"aspect_ratio\":1.781,\"height\":842,\"iso_639_1\":\"en\",\"file_path\":\"/6hMN4oospeDItQlACbAWkjI7nC9.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1500}],\"posters\":[{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/r8Ph5MYXL04Qzu4QBbq2KjqwtkQ.jpg\",\"vote_average\":5.516,\"vote_count\":14,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pt\",\"file_path\":\"/suaJuFprbgdZaTE0mOt0xWIGFyQ.jpg\",\"vote_average\":5.454,\"vote_count\":3,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/gq5Wi7i4SF3lo4HHkJasDV95xI9.jpg\",\"vote_average\":5.444,\"vote_count\":25,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/bYbHqvRANCpuRTs0RAu10LhmVKU.jpg\",\"vote_average\":5.392,\"vote_count\":8,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/22dj38IckjzEEUZwN1tPU5VJ1qq.jpg\",\"vote_average\":5.39,\"vote_count\":6,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/tdQzRSk4PXX6hzjLcQWHafYtZTI.jpg\",\"vote_average\":5.388,\"vote_count\":4,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pl\",\"file_path\":\"/gbaFVZMVL0nUhZLmX3TWNZj8ydE.jpg\",\"vote_average\":5.384,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/btVpLbQCNE8mDTRrb6Llk5B5pGr.jpg\",\"vote_average\":5.334,\"vote_count\":11,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":2529,\"iso_639_1\":\"en\",\"file_path\":\"/pWVLFh4OuejTpUaDQbB1C4zoS2p.jpg\",\"vote_average\":5.33,\"vote_count\":9,\"width\":1686},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/aSrMJYmQX8kpF26LijkCsYhBMvm.jpg\",\"vote_average\":5.322,\"vote_count\":5,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/ww4rH6EQ3610fBNuZBdIL9hSYkE.jpg\",\"vote_average\":5.322,\"vote_count\":5,\"width\":2000},{\"aspect_ratio\":0.666,\"height\":1426,\"iso_639_1\":\"ru\",\"file_path\":\"/8X3WoKnDw9r7SIvM5vx0mpnb2yZ.jpg\",\"vote_average\":5.322,\"vote_count\":5,\"width\":950},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"fr\",\"file_path\":\"/6mHkagjziBPth2Mx0VpEercocm4.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/8Li4KawpEa5i2gm5gFSBKmEFtvy.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pt\",\"file_path\":\"/fI9R8fkW21fv0HDrwNnM3PZhgN.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"ru\",\"file_path\":\"/y6kKwGLCCy3MMbBdUnxB3afIfsd.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":2529,\"iso_639_1\":\"en\",\"file_path\":\"/xFnzs2hjiWBgv46XnCdBUToBKED.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":1686},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pl\",\"file_path\":\"/4QfUvGMaSMoItapTeg51Knf1PiF.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/rG8P8pPUDSm02VW3cKtivca4rqE.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/jGNtfNeFRmJBIwL1exFteZhedOr.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":2000},{\"aspect_ratio\":0.666,\"height\":1000,\"iso_639_1\":\"es\",\"file_path\":\"/qJNGWrKB3Bnshc1iuedpxXbVQMe.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":666},{\"aspect_ratio\":0.667,\"height\":2250,\"iso_639_1\":\"sk\",\"file_path\":\"/ojQvEl8rFqJWYIATlDCUtxa1TeV.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1500},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/fByDz2DSFKR8jugyApmHFUQF1pq.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/oFgwvpoPi2Ixcg3YLxQpYhoH1Jm.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/9cSsr4dqTSqSlUOsbufco2YRrZQ.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/l9cWYWFwRZNdw0r2gesdDyXTbGx.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/sqYlJCjwdbhxlhbOVK9iMLYUZIF.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/qhEimz49g0r2sQ06Xfb8Hxmfk3T.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.666,\"height\":3000,\"iso_639_1\":\"uk\",\"file_path\":\"/hU6FebQXRKu0bd0VMNa8mTal8Eh.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1999},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/cEHz2gnXYZuqNGc8hAy35VgIvbT.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/drr5Td2aWuUR23ckuSOP6DhXBGL.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":750,\"iso_639_1\":\"fr\",\"file_path\":\"/ufEdffeQOl8oTDHrBh34cDZtuZl.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":500},{\"aspect_ratio\":0.667,\"height\":750,\"iso_639_1\":\"fr\",\"file_path\":\"/ikiFMVGhCePycr7MQQd8FufPh1F.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":500},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/vKeB6QYgi0b7VHHmeJ8JZzC99K8.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/mLRwi2OQZWT58tOH83ysZWMnhUN.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/hf10Oz89bIyrtjKraH849ZCQliM.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/10rGm5WQpXclsqr2T8SFLYWMI0Q.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"el\",\"file_path\":\"/kX5kXDAemzVv7yHezufeHDDGHkl.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/mEpQbsUSekbQRdffXMeQWjeHb34.jpg\",\"vote_average\":5.31,\"vote_count\":24,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/iTQHKziZy9pAAY4hHEDCGPaOvFC.jpg\",\"vote_average\":5.296,\"vote_count\":20,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/bLPTI0236VjeBhcycu2wUwNSXGv.jpg\",\"vote_average\":5.276,\"vote_count\":12,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/z37SuzzQZawvdBmtYcQWxriQmCK.jpg\",\"vote_average\":5.27,\"vote_count\":10,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":2100,\"iso_639_1\":\"en\",\"file_path\":\"/drJ1vvVlwr5bmH9ssOl1m37q3Lc.jpg\",\"vote_average\":5.258,\"vote_count\":6,\"width\":1400},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/lYFNh6yeYWTPgg0qvnZMKKA8RS1.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pt\",\"file_path\":\"/v3e56rck9tv8zeMuNldJdtpgFeQ.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/dcVdgUBO8lpuKpH7GzeyeqjSO0l.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"ru\",\"file_path\":\"/wRBGET9QNCOQJY55yAA1ZyF6cCb.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pt\",\"file_path\":\"/t2sABFPr9ft0bJ6XYdhCPsfooCd.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.701,\"height\":1426,\"iso_639_1\":\"es\",\"file_path\":\"/tGKRoZprIpJXFNvOtWu93KfWYIk.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"de\",\"file_path\":\"/46oFAcjORMltwPxR6uU6hM4mN7F.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"de\",\"file_path\":\"/5gmlZYd76FPrc8zLNVDEDVQL9fh.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/wCRLEnMHmMLiQ6ixs8lbggLeNq4.jpg\",\"vote_average\":5.238,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/aLDdG5e3c2qNMcWzlxAnW15okOr.jpg\",\"vote_average\":5.226,\"vote_count\":10,\"width\":1000},{\"aspect_ratio\":0.681,\"height\":1240,\"iso_639_1\":\"fr\",\"file_path\":\"/jVTIJ33eGKja0SfI40ntASPBmnw.jpg\",\"vote_average\":5.224,\"vote_count\":4,\"width\":844},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"es\",\"file_path\":\"/7TOaabZ4TFqtn8cD1Jw1G7ycgSs.jpg\",\"vote_average\":5.202,\"vote_count\":2,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"es\",\"file_path\":\"/zwFQlQZYf6Zh6FncP76okjFZZfh.jpg\",\"vote_average\":5.202,\"vote_count\":2,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"de\",\"file_path\":\"/fYWbvEBCLHWPHo0QZt6o7dKBSLP.jpg\",\"vote_average\":5.198,\"vote_count\":7,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/kVstTGhkSsILxxIUYIEGmlaYTFe.jpg\",\"vote_average\":5.182,\"vote_count\":5,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/k6SPwdWi1m3p2JhoYn2KhRgZgEx.jpg\",\"vote_average\":5.18,\"vote_count\":3,\"width\":2000},{\"aspect_ratio\":0.666,\"height\":997,\"iso_639_1\":\"uk\",\"file_path\":\"/juoqZnVARJhZn5UjRodl6rVHXHY.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":664},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"ru\",\"file_path\":\"/58CAUPUgoTTA1LuesMrM5CbpcuW.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"ru\",\"file_path\":\"/defdE4jKZSBJ4DxdmOtYnLz8Qj7.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"it\",\"file_path\":\"/lBdOIyD5rOJA34qiDi3yrZqdbg7.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"pt\",\"file_path\":\"/pKLFj7UNEcsRJxV69xmq6BB2i9s.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"sk\",\"file_path\":\"/t06usnuvImXwTa92SHoAkMEn8v2.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"sk\",\"file_path\":\"/y8T6UdWBPSG878n2sZiddx9vWER.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"sk\",\"file_path\":\"/aWxzsGF7PaZKR77F7SXkTc6npP1.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/xAwL3ySFqWHYjpqXlQQXcbWCoII.jpg\",\"vote_average\":5.128,\"vote_count\":6,\"width\":1000},{\"aspect_ratio\":0.715,\"height\":1437,\"iso_639_1\":\"ru\",\"file_path\":\"/me843ySolO7vwJqQcJ6OUbcRM3H.jpg\",\"vote_average\":5.118,\"vote_count\":4,\"width\":1027},{\"aspect_ratio\":0.701,\"height\":1426,\"iso_639_1\":\"fr\",\"file_path\":\"/4B4OwAiu0xhOLI0p1AWBifG3qPE.jpg\",\"vote_average\":5.118,\"vote_count\":4,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/4gsn3sBxH3Owx1Id7lTYkW52524.jpg\",\"vote_average\":5.118,\"vote_count\":4,\"width\":1000},{\"aspect_ratio\":0.75,\"height\":1200,\"iso_639_1\":\"fr\",\"file_path\":\"/mWAfAZVaw9mOOFEpaPwJHRENPza.jpg\",\"vote_average\":5.072,\"vote_count\":9,\"width\":900},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/xwsYa1wA9EB9ibW1stJZpqHznKY.jpg\",\"vote_average\":5.058,\"vote_count\":6,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/dLBoWkfIbEQRAYiXdB2uMXAqFoT.jpg\",\"vote_average\":5.056,\"vote_count\":5,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/y6oGacKFP025f0PVwG94X60jjQS.jpg\",\"vote_average\":5.054,\"vote_count\":15,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/klv4rvIxnyJcZAI3DFvW5gHTSpM.jpg\",\"vote_average\":5.004,\"vote_count\":10,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"hu\",\"file_path\":\"/qgnOC2T0kmxWOS32SKGsbtxSvN6.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.664,\"height\":1084,\"iso_639_1\":\"en\",\"file_path\":\"/gZPLydtYmniGwP4zoxTnP47yWnu.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":720},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/6EvyuI0XpL7JopXTE72FsgM5d47.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/3JacSFXvk9AbCjz0nTdHMkDwTTH.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pl\",\"file_path\":\"/18ticQ3bpUUGZGCR3pGglrz7ly0.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pl\",\"file_path\":\"/hCxhxuc5or4ZKtiwQDmWBUN7Xbr.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.701,\"height\":1426,\"iso_639_1\":\"en\",\"file_path\":\"/vGkiaAWM6B0bFyz2aW3fSRSM8cH.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":2100,\"iso_639_1\":\"en\",\"file_path\":\"/oG2xkP2Kwkrn3C8dyqyRXMOEx50.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1400},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pl\",\"file_path\":\"/pYOArjBUvtPBsuWTIE58lQTrDwn.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"ru\",\"file_path\":\"/ajd1f8pX1JcYZBrxbAVm3l53TJ7.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.675,\"height\":1481,\"iso_639_1\":\"en\",\"file_path\":\"/lGM4SPc5MtQDUTz6M18aVTEjy7Y.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":2400,\"iso_639_1\":\"en\",\"file_path\":\"/q2FanXsFtdrOsrGplVtOg7oFrc3.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1600},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/8EjZLn7SZ9fG6l2anOJwB8u6prb.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.71,\"height\":2818,\"iso_639_1\":null,\"file_path\":\"/1U4s6OoPoVScNh2xFNfzLMGDu59.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/27d091mfAQ7PJ0TrZaglWPzm0va.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"es\",\"file_path\":\"/v4dUG5ujNR63UbEDfSDZ3KaINlh.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/nf3N6GphVFJCTUdlb4nQyxgFk7T.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"he\",\"file_path\":\"/yvQdymDQiTYHLsE7qv41liZ7auy.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/zVEJCIguJkxSFaQZSSFMq6l2Vq3.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/sJ0zFbzrTAG3riisqLuhF8WcM45.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/mWU0DuJtl2bOno6kwXs3HZ3abwC.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/9m4sVAYCZcxdJR3D4xAbLZE7PuE.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"fr\",\"file_path\":\"/7s98is4MxeDVCxIVrAsfrr50dMm.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"cs\",\"file_path\":\"/y2SNPwLT9zdZjJQRVX7T5u8mko7.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"cs\",\"file_path\":\"/z9QaA7oszDSY0jLgv0mDkYF7u8M.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.666,\"height\":2437,\"iso_639_1\":\"en\",\"file_path\":\"/knhIHcaUdLExfdksyvcIEssbJzT.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1624},{\"aspect_ratio\":0.666,\"height\":2437,\"iso_639_1\":\"en\",\"file_path\":\"/nH3TpzQOPtnqauB8kntTnljBIns.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1624},{\"aspect_ratio\":0.666,\"height\":2437,\"iso_639_1\":\"en\",\"file_path\":\"/4b3V0P5hpUHTM8ggfQQFFqKe5lc.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1624},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"fr\",\"file_path\":\"/hpwpPOuuAuSadR2BNSKKAz9aD9O.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.666,\"height\":1762,\"iso_639_1\":\"en\",\"file_path\":\"/p8PPWEfm30i9pIcbu5fXQBcTi5L.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1174},{\"aspect_ratio\":0.667,\"height\":2250,\"iso_639_1\":\"en\",\"file_path\":\"/bH5tGEuQexH0bt4ruobaquxv7U4.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1500},{\"aspect_ratio\":0.711,\"height\":750,\"iso_639_1\":\"el\",\"file_path\":\"/j0m8uIWawPibEAzYdlf0t7GRzJs.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":533},{\"aspect_ratio\":0.667,\"height\":1024,\"iso_639_1\":null,\"file_path\":\"/6Rj64rPRrzoN0Dm7UQdW36YwuIi.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":683}]}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "id": {
                      "type": "integer",
                      "example": 10,
                      "default": 0
                    },
                    "backdrops": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "aspect_ratio": {
                            "type": "number",
                            "example": 1.778,
                            "default": 0
                          },
                          "height": {
                            "type": "integer",
                            "example": 1080,
                            "default": 0
                          },
                          "iso_639_1": {},
                          "file_path": {
                            "type": "string",
                            "example": "/d8duYyyC9J5T825Hg7grmaabfxQ.jpg"
                          },
                          "vote_average": {
                            "type": "number",
                            "example": 5.464,
                            "default": 0
                          },
                          "vote_count": {
                            "type": "integer",
                            "example": 30,
                            "default": 0
                          },
                          "width": {
                            "type": "integer",
                            "example": 1920,
                            "default": 0
                          }
                        }
                      }
                    },
                    "posters": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "aspect_ratio": {
                            "type": "number",
                            "example": 0.667,
                            "default": 0
                          },
                          "height": {
                            "type": "integer",
                            "example": 3000,
                            "default": 0
                          },
                          "iso_639_1": {
                            "type": "string",
                            "example": "en"
                          },
                          "file_path": {
                            "type": "string",
                            "example": "/r8Ph5MYXL04Qzu4QBbq2KjqwtkQ.jpg"
                          },
                          "vote_average": {
                            "type": "number",
                            "example": 5.516,
                            "default": 0
                          },
                          "vote_count": {
                            "type": "integer",
                            "example": 14,
                            "default": 0
                          },
                          "width": {
                            "type": "integer",
                            "example": 2000,
                            "default": 0
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "deprecated": false
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true
}
```

# Movies
Images

# Images

Get the images that belong to a movie.

This method will return the backdrops, posters and logos that have been added to a movie.

> 📘 Note
>
> If you have a `language` specified, it will act as a filter on the returned items. You can use the `include_image_language` param to query additional languages.

# OpenAPI definition

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "tmdb-api",
    "version": "3"
  },
  "servers": [
    {
      "url": "https://api.themoviedb.org"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "apiKey",
        "in": "header",
        "name": "Authorization",
        "x-bearer-format": "bearer"
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/3/movie/{movie_id}/images": {
      "get": {
        "summary": "Images",
        "description": "Get the images that belong to a movie.",
        "operationId": "movie-images",
        "parameters": [
          {
            "name": "movie_id",
            "in": "path",
            "schema": {
              "type": "integer",
              "format": "int32"
            },
            "required": true
          },
          {
            "name": "include_image_language",
            "in": "query",
            "description": "specify a comma separated list of ISO-639-1 values to query, for example: `en-US,null`",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "language",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\"backdrops\":[{\"aspect_ratio\":1.778,\"height\":800,\"iso_639_1\":null,\"file_path\":\"/hZkgoQYus5vegHoetLkCJzb17zJ.jpg\",\"vote_average\":5.622,\"vote_count\":20,\"width\":1422},{\"aspect_ratio\":1.778,\"height\":720,\"iso_639_1\":\"en\",\"file_path\":\"/fygeMr16EcxJiYhdiO1LEr7iHtI.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":1280},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/b9HyPoxwxjxkWEUL5ErZdhApQe2.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1440,\"iso_639_1\":null,\"file_path\":\"/c6OLXfKAk5BKeR6broC8pYiCquX.jpg\",\"vote_average\":5.292,\"vote_count\":18,\"width\":2560},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/3nv2TEz2u178xPXzdKlZdUh5uOI.jpg\",\"vote_average\":5.276,\"vote_count\":12,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/yguBaPk5V0nZCcSBthre4YFMAgk.jpg\",\"vote_average\":5.212,\"vote_count\":11,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/xRyINp9KfMLVjRiO5nCsoRDdvvF.jpg\",\"vote_average\":5.206,\"vote_count\":9,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/bsfJoKVAqFzlhvbt8AffjvYAtN4.jpg\",\"vote_average\":5.19,\"vote_count\":5,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/kpRWGjh3SsYjuF26HyRhCJJkMRk.jpg\",\"vote_average\":5.19,\"vote_count\":5,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/5pxdgKVEDWDQBtvqIB2eB2oheml.jpg\",\"vote_average\":5.18,\"vote_count\":3,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":720,\"iso_639_1\":\"en\",\"file_path\":\"/yPeG1RQm5Am0eslu0IwUEJ4VXND.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1280},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/jAvY6IN6MIxmPM2oAtNqYK7P2gi.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1920},{\"aspect_ratio\":1.777,\"height\":793,\"iso_639_1\":null,\"file_path\":\"/52AfXWuXCHn3UjD17rBruA9f5qb.jpg\",\"vote_average\":5.146,\"vote_count\":10,\"width\":1409},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/ruJPyRrHYPS071XzVGPX3peYi0x.jpg\",\"vote_average\":5.146,\"vote_count\":10,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1439,\"iso_639_1\":null,\"file_path\":\"/rr7E0NoGKxvbkb89eR1GwfoYjpA.jpg\",\"vote_average\":5.144,\"vote_count\":23,\"width\":2559},{\"aspect_ratio\":1.778,\"height\":1964,\"iso_639_1\":null,\"file_path\":\"/8iVyhmjzUbvAGppkdCZPiyEHSoF.jpg\",\"vote_average\":5.138,\"vote_count\":8,\"width\":3492},{\"aspect_ratio\":1.778,\"height\":900,\"iso_639_1\":null,\"file_path\":\"/3qFgjOYLnEUfBxt5yWRKmRRrh9w.jpg\",\"vote_average\":5.138,\"vote_count\":8,\"width\":1600},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/eZRY604RqrnT2Yxz0GwGo7tRChX.jpg\",\"vote_average\":5.128,\"vote_count\":6,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/5OjjPVk14NZRp8N5UUS6k55hbfp.jpg\",\"vote_average\":5.118,\"vote_count\":4,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":2160,\"iso_639_1\":null,\"file_path\":\"/vxqKGixpgNndTz58YbFpTlw8lpB.jpg\",\"vote_average\":5.118,\"vote_count\":4,\"width\":3840},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/nHOaLyQeV9isvyxF7mMH2TUG8IK.jpg\",\"vote_average\":5.118,\"vote_count\":4,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/rv972EWgze3DZitMMY8AEDzD9HK.jpg\",\"vote_average\":5.118,\"vote_count\":4,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":2160,\"iso_639_1\":null,\"file_path\":\"/vfEuh0ELDkHWu3UfJiEkWN8Z4tc.jpg\",\"vote_average\":5.118,\"vote_count\":4,\"width\":3840},{\"aspect_ratio\":1.776,\"height\":1172,\"iso_639_1\":null,\"file_path\":\"/2SW1FZHZw4ncy61pb8jcgrzVQVk.jpg\",\"vote_average\":5.106,\"vote_count\":2,\"width\":2082},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/1lBuRNwlqUs4BeF7UR4RuAgp2KW.jpg\",\"vote_average\":5.106,\"vote_count\":2,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/7XEtHQoy1hwa8XWaOkSv3rlteea.jpg\",\"vote_average\":5.09,\"vote_count\":11,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/yrN6gon5NG6t7Lgh05byChFSZem.jpg\",\"vote_average\":5.08,\"vote_count\":9,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":720,\"iso_639_1\":null,\"file_path\":\"/qRNDy8RLjd7WAD8GGTBmzGAFFGF.jpg\",\"vote_average\":5.044,\"vote_count\":3,\"width\":1280},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/aKSnDPpYxaalpDkla9LyIzn2bjq.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/sty6obiES7ZMkEaCWt5dthRbvHT.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/9sxsHE74N1SXYpXzUEiO3PoDvan.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/o9PU3vpXhpl13qogQ8gLL30wH2Y.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/wRxE40hwcSWSkHUnj8zGMf5tnab.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/maCmEa61kG3cIvoCwdFtEbrJThT.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/mvvVcyJwj7n8iwgPsTFUWzc9N8L.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/tOciO9nqIZn1MbnMxu5Rweayd83.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/8KEWr4K6zyF77RDIqZAeMpi2MRV.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/fSJpyCCOPblKc2GHgTi682d7mqF.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/xJC7qhzgPJXEEi4EdAxYUF1WEGf.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1152,\"iso_639_1\":\"pt\",\"file_path\":\"/rCMuTyJGT2GJzXcvWeYAVHQQRFS.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2048},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"sv\",\"file_path\":\"/zSB4QpFOqQXGeugeKALCK7hoX68.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920}],\"id\":550,\"logos\":[{\"aspect_ratio\":5.203,\"height\":79,\"iso_639_1\":\"he\",\"file_path\":\"/c1KLulrIhUqY5fT42nmC5aERGCp.png\",\"vote_average\":5.312,\"vote_count\":1,\"width\":411},{\"aspect_ratio\":8.502,\"height\":235,\"iso_639_1\":\"pt\",\"file_path\":\"/qqAcl1YIT5Sa2nx8tKQcervQCco.png\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1998},{\"aspect_ratio\":4.638,\"height\":389,\"iso_639_1\":\"en\",\"file_path\":\"/7Uqhv24pGJs4Ns31NoOPWFJGWNG.png\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1804},{\"aspect_ratio\":1.329,\"height\":1275,\"iso_639_1\":\"en\",\"file_path\":\"/v7JwpiYf2knmf2R2mLLvJmNxy9x.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1694},{\"aspect_ratio\":0.848,\"height\":1295,\"iso_639_1\":\"en\",\"file_path\":\"/4XkF0Rf7gvSfea8fYLFbU5tmuJw.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1098},{\"aspect_ratio\":1.5,\"height\":290,\"iso_639_1\":\"en\",\"file_path\":\"/y9dOBfqWvCdxQcwBSPT2nfXGJpi.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":435},{\"aspect_ratio\":0.861,\"height\":294,\"iso_639_1\":\"en\",\"file_path\":\"/7s3aiqRnwRUVpwtxFLrWyMITHSC.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":253},{\"aspect_ratio\":1.324,\"height\":293,\"iso_639_1\":\"es\",\"file_path\":\"/xJe4B5TVXvjldcdlwlSgJ7PtjDu.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":388},{\"aspect_ratio\":2.134,\"height\":298,\"iso_639_1\":\"es\",\"file_path\":\"/z6yka0HngU3FPjcWBc4CSxokUg0.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":636},{\"aspect_ratio\":1.29,\"height\":310,\"iso_639_1\":\"en\",\"file_path\":\"/ahnGkBeGqvUtpyfOqoWt9Cto9WR.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":400},{\"aspect_ratio\":1.34,\"height\":300,\"iso_639_1\":\"en\",\"file_path\":\"/fI7UHnoU685iz4eG7lQu7aKfxPW.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":402},{\"aspect_ratio\":1.766,\"height\":295,\"iso_639_1\":\"en\",\"file_path\":\"/hfbxs6yi35ciD6xcuGz0eeHfpm9.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":521},{\"aspect_ratio\":0.868,\"height\":296,\"iso_639_1\":\"en\",\"file_path\":\"/ofkQTAMEY6N8MSiezFMxdQtej3o.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":257},{\"aspect_ratio\":2.209,\"height\":1298,\"iso_639_1\":\"pt\",\"file_path\":\"/5TVHz85ylbxt1jTbZ2DfPsKioX0.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2867},{\"aspect_ratio\":2.209,\"height\":1298,\"iso_639_1\":\"pt\",\"file_path\":\"/k8KZ4lH1GRNNJo6n8FZjCDTBIaL.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2867},{\"aspect_ratio\":1.382,\"height\":296,\"iso_639_1\":\"en\",\"file_path\":\"/a3YV8Fnue6LTuSRuvnLxvEPeZxz.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":409},{\"aspect_ratio\":3.365,\"height\":233,\"iso_639_1\":\"en\",\"file_path\":\"/yDcFmXCT4XUkTujDY3p1auO8Po5.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":784},{\"aspect_ratio\":1.371,\"height\":294,\"iso_639_1\":\"en\",\"file_path\":\"/mjrGAw5IyGQIYsJaqGIyxgvnfZj.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":403},{\"aspect_ratio\":2.085,\"height\":295,\"iso_639_1\":\"ru\",\"file_path\":\"/y9RSpK5PpMYEkfdCRofBp09KpW9.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":615},{\"aspect_ratio\":1.749,\"height\":299,\"iso_639_1\":\"es\",\"file_path\":\"/tYztBlJpIClYUznEI1G0mQWxoCO.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":523},{\"aspect_ratio\":2.103,\"height\":428,\"iso_639_1\":\"ru\",\"file_path\":\"/aj0TDYImCd1bd0woML4I5t3C2Qh.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":900},{\"aspect_ratio\":1.041,\"height\":244,\"iso_639_1\":\"en\",\"file_path\":\"/40uRxnaxKNIxZPVKVMizbe76a8h.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":254},{\"aspect_ratio\":1.474,\"height\":661,\"iso_639_1\":\"he\",\"file_path\":\"/nDZdalfIZ3v7vx56zHo3HtApGqG.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":974},{\"aspect_ratio\":1.332,\"height\":244,\"iso_639_1\":\"pt\",\"file_path\":\"/l8pqQ4bwdU8IkdAvEM2PVYjqYCT.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":325},{\"aspect_ratio\":1.472,\"height\":536,\"iso_639_1\":\"ro\",\"file_path\":\"/spz7zdPaSFQPicmSdCvpIzTwsHo.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":789},{\"aspect_ratio\":2.536,\"height\":304,\"iso_639_1\":\"pl\",\"file_path\":\"/dYd6n3eOlijsiX25OV3sfHqCF10.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":771},{\"aspect_ratio\":1.297,\"height\":538,\"iso_639_1\":\"th\",\"file_path\":\"/pHsyBpUS4uz288bpZtnCmPHYxmN.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":698},{\"aspect_ratio\":7.313,\"height\":297,\"iso_639_1\":\"hu\",\"file_path\":\"/oMV5afEbMOxh1nowR1tLxFpIEhH.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2172}],\"posters\":[{\"aspect_ratio\":0.667,\"height\":900,\"iso_639_1\":\"pt\",\"file_path\":\"/r3pPehX4ik8NLYPpbDRAh0YRtMb.jpg\",\"vote_average\":5.258,\"vote_count\":6,\"width\":600},{\"aspect_ratio\":0.667,\"height\":1350,\"iso_639_1\":\"ru\",\"file_path\":\"/66RvLrRJTm4J8l3uHXWF09AICol.jpg\",\"vote_average\":5.522,\"vote_count\":4,\"width\":900},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg\",\"vote_average\":5.504,\"vote_count\":46,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/a26cQPRhJPX6GbWfQbvZdrrp9j9.jpg\",\"vote_average\":5.46,\"vote_count\":25,\"width\":2000},{\"aspect_ratio\":0.706,\"height\":2834,\"iso_639_1\":\"en\",\"file_path\":\"/14Cs3sr6nus6QTHThldis8p4Nlm.jpg\",\"vote_average\":5.384,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":2100,\"iso_639_1\":\"tr\",\"file_path\":\"/yjMuqAyJUoQZGWsZ0vZuYj5inAR.jpg\",\"vote_average\":5.384,\"vote_count\":2,\"width\":1400},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"he\",\"file_path\":\"/7Tmjr0jgVj8hHcd3UJD6HIilMKM.jpg\",\"vote_average\":5.384,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pt\",\"file_path\":\"/ohXr0v9U0TfFu9IXbSDm5zoGV3R.jpg\",\"vote_average\":5.33,\"vote_count\":9,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":2100,\"iso_639_1\":\"es\",\"file_path\":\"/1yWmCAIGSVNuTOGyz9F48W9g1Ux.jpg\",\"vote_average\":5.326,\"vote_count\":7,\"width\":1400},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"ko\",\"file_path\":\"/eKZ07Ted7VHxQjbuZrRBFOamcKJ.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":1000},{\"aspect_ratio\":0.666,\"height\":1418,\"iso_639_1\":\"uk\",\"file_path\":\"/266SbE7HFsEbvprMagQyf19PDsn.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":945},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"es\",\"file_path\":\"/sgTAWJFaB2kBvdQxRGabYFiQqEK.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"es\",\"file_path\":\"/6HRbhpNd32STZ3QqtoRCuoow1EI.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"he\",\"file_path\":\"/d23jzgwz3G7CPBEj3gNusWmkd64.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1200,\"iso_639_1\":\"de\",\"file_path\":\"/rUPKPWBpr2ZbDXXZpT0qgYqTlG9.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":800},{\"aspect_ratio\":0.667,\"height\":2250,\"iso_639_1\":\"it\",\"file_path\":\"/rtNLQ8HbPElzEfrHjrzSr07prKT.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":1500},{\"aspect_ratio\":0.667,\"height\":750,\"iso_639_1\":\"pl\",\"file_path\":\"/efBb4gjjKneUoBVgfFOUu2OwihS.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":500},{\"aspect_ratio\":0.667,\"height\":2250,\"iso_639_1\":\"it\",\"file_path\":\"/xEAX4Hq21wZcRhspT7VyGtTspsp.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1500},{\"aspect_ratio\":0.667,\"height\":1620,\"iso_639_1\":\"ru\",\"file_path\":\"/8GJpI9jGsnJQ6wSnYTbddrbjsWB.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1080},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pt\",\"file_path\":\"/nu7FEmC4zBaZ7c3QYmVpDlZa2H0.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/6DFl63gJmQPxWBPRucHegEJ2Qns.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1200,\"iso_639_1\":\"en\",\"file_path\":\"/9VOESirK1bX66Xenj9QHcl5GJU9.jpg\",\"vote_average\":5.282,\"vote_count\":14,\"width\":800},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/jSziioSwPVrOy9Yow3XhWIBDjq1.jpg\",\"vote_average\":5.27,\"vote_count\":10,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pt\",\"file_path\":\"/mZDc9F3uNSgUNaudb1VtumPs3dL.jpg\",\"vote_average\":5.252,\"vote_count\":4,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"fr\",\"file_path\":\"/6NdNO1dq9w54ujk2G4sK4ogsf0H.jpg\",\"vote_average\":5.252,\"vote_count\":4,\"width\":1000},{\"aspect_ratio\":0.666,\"height\":1000,\"iso_639_1\":\"en\",\"file_path\":\"/b1ONg8Is4l760oryJa7Aw7LdPtM.jpg\",\"vote_average\":5.252,\"vote_count\":4,\"width\":666},{\"aspect_ratio\":0.701,\"height\":1426,\"iso_639_1\":\"en\",\"file_path\":\"/8kNruSfhk5IoE4eZOc4UpvDn6tq.jpg\",\"vote_average\":5.25,\"vote_count\":23,\"width\":1000},{\"aspect_ratio\":0.666,\"height\":1522,\"iso_639_1\":\"uk\",\"file_path\":\"/x43vYIPjcVvts7iHw6GH8sU1tiZ.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1014},{\"aspect_ratio\":0.721,\"height\":1020,\"iso_639_1\":\"he\",\"file_path\":\"/v7Y0dqAMYBsdkiPVM5btdNkhzmt.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":735},{\"aspect_ratio\":0.721,\"height\":1020,\"iso_639_1\":\"he\",\"file_path\":\"/nXZ5rghMvQayEGytShNxiLaEWLk.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":735},{\"aspect_ratio\":0.667,\"height\":2100,\"iso_639_1\":\"en\",\"file_path\":\"/obVTG7QMbQ7gV3oZAJuFjKBhsGk.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1400},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/uVe8UnJTgLso26NtA8GB4M0RDLh.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":2400,\"iso_639_1\":\"en\",\"file_path\":\"/dMgcjU3uaL9BhizmZbrGJsPQ8h4.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1600},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"de\",\"file_path\":\"/aRgu4CfNcCIHGOnbX81IPujQ3bO.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1000},{\"aspect_ratio\":0.698,\"height\":2865,\"iso_639_1\":\"ko\",\"file_path\":\"/uEsdm0noLfmkcVrZlyyuXp9e5I7.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"es\",\"file_path\":\"/6ZO199essPSa8taBHB4zLvOJLDD.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.669,\"height\":2278,\"iso_639_1\":\"en\",\"file_path\":\"/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg\",\"vote_average\":5.232,\"vote_count\":17,\"width\":1524},{\"aspect_ratio\":0.754,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/wR5HZWdVpcXx9sevV1bQi7rP4op.jpg\",\"vote_average\":5.212,\"vote_count\":11,\"width\":1131},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"es\",\"file_path\":\"/63j6sG0Q7GpLLNbGKgmFmAp7xT9.jpg\",\"vote_average\":5.198,\"vote_count\":7,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"es\",\"file_path\":\"/cm8dnS4MF3jtz0mvA9nEiDy0kxl.jpg\",\"vote_average\":5.19,\"vote_count\":5,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"es\",\"file_path\":\"/xfRCDSmdMQSISmLxI0r8hQ9GIQa.jpg\",\"vote_average\":5.19,\"vote_count\":5,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"es\",\"file_path\":\"/pOzC3JAt5kG6tJSNgp4N46T5QTI.jpg\",\"vote_average\":5.19,\"vote_count\":5,\"width\":2000},{\"aspect_ratio\":0.698,\"height\":1433,\"iso_639_1\":\"ko\",\"file_path\":\"/kabpExFv9JLp778w9ZtCtZnWH9N.jpg\",\"vote_average\":5.18,\"vote_count\":3,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":null,\"file_path\":\"/a1hxQhCl2i9DmbjKXixkukVW7zy.jpg\",\"vote_average\":5.18,\"vote_count\":3,\"width\":2000},{\"aspect_ratio\":0.711,\"height\":1066,\"iso_639_1\":\"pt\",\"file_path\":\"/8pcOlY6jaupFKTIy2aeKCKZ2GMj.jpg\",\"vote_average\":5.18,\"vote_count\":3,\"width\":758},{\"aspect_ratio\":0.666,\"height\":1066,\"iso_639_1\":\"pt\",\"file_path\":\"/lZcILaI9vvoCUVxl9KnUKeL6sKc.jpg\",\"vote_average\":5.18,\"vote_count\":3,\"width\":710},{\"aspect_ratio\":0.707,\"height\":1403,\"iso_639_1\":\"en\",\"file_path\":\"/wlmGPHDbnOK4AwL37m6tegxO8A3.jpg\",\"vote_average\":5.18,\"vote_count\":3,\"width\":992},{\"aspect_ratio\":0.667,\"height\":2100,\"iso_639_1\":\"en\",\"file_path\":\"/hPkAixiAyXzQb8uTOiovuhpDBK2.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1400},{\"aspect_ratio\":0.671,\"height\":1361,\"iso_639_1\":\"ko\",\"file_path\":\"/4quCAKpCylIy991IHkLCuXCzO1a.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":913},{\"aspect_ratio\":0.671,\"height\":1361,\"iso_639_1\":\"ko\",\"file_path\":\"/kZfIYkflKe52rbzUruBUIqX5KOV.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":913},{\"aspect_ratio\":0.667,\"height\":2400,\"iso_639_1\":\"en\",\"file_path\":\"/7Yl18M6LegCaMuwYDkEhohXsG1b.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1600},{\"aspect_ratio\":0.701,\"height\":1426,\"iso_639_1\":\"ta\",\"file_path\":\"/bo2IVEKV7BtHLHOWF1zfuqoHnfp.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":2400,\"iso_639_1\":\"en\",\"file_path\":\"/tcmNYC8ub4E51gkErXoIgkbESZH.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1600},{\"aspect_ratio\":0.701,\"height\":1426,\"iso_639_1\":\"en\",\"file_path\":\"/k1lICEYRpJeFRIRfjxYwmpO9LTu.jpg\",\"vote_average\":5.128,\"vote_count\":6,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":2100,\"iso_639_1\":\"fr\",\"file_path\":\"/iqR0M1ln7Kobjp9liUj2Q7mtQZG.jpg\",\"vote_average\":5.118,\"vote_count\":4,\"width\":1400},{\"aspect_ratio\":0.698,\"height\":1433,\"iso_639_1\":\"ko\",\"file_path\":\"/5vgorfLOTe6w8Ti68s25kzXxjun.jpg\",\"vote_average\":5.106,\"vote_count\":2,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"es\",\"file_path\":\"/cp6PLg9gGItJBIQlnEfikqZMvah.jpg\",\"vote_average\":5.068,\"vote_count\":7,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1800,\"iso_639_1\":\"en\",\"file_path\":\"/fCTjGJxKWZGWQDCGFGYMGvh4VNP.jpg\",\"vote_average\":5.068,\"vote_count\":7,\"width\":1200},{\"aspect_ratio\":0.687,\"height\":1200,\"iso_639_1\":\"es\",\"file_path\":\"/974fFjwHSjMkZhH0HOZZcOyRM2h.jpg\",\"vote_average\":4.922,\"vote_count\":5,\"width\":824},{\"aspect_ratio\":0.706,\"height\":1000,\"iso_639_1\":\"be\",\"file_path\":\"/eKtuGJQJ06iafhYl22mYCWidjmM.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":706},{\"aspect_ratio\":0.667,\"height\":1800,\"iso_639_1\":null,\"file_path\":\"/fFkMxrBYnEBcEHotxTQwx2nAncy.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1200},{\"aspect_ratio\":0.667,\"height\":1800,\"iso_639_1\":\"hu\",\"file_path\":\"/74RcH5EIo9IrPIgsZw7mGd989tW.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1200},{\"aspect_ratio\":0.71,\"height\":1353,\"iso_639_1\":\"it\",\"file_path\":\"/4Fb5srk9F3jo561ig451r7O3EgR.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":960},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"cs\",\"file_path\":\"/nYtec2BxtcupGTdOMcIscG6rkhQ.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":2100,\"iso_639_1\":\"pt\",\"file_path\":\"/rwUtDfMvMQsGrjpyS27ASLlJ6J5.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1400},{\"aspect_ratio\":0.667,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/A86dg5r6tdUVvQBeOGhvgTXGoQi.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":720},{\"aspect_ratio\":0.667,\"height\":2100,\"iso_639_1\":\"en\",\"file_path\":\"/m10ywT1Bnazwhccdymn6hap6Fmw.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1400},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/uwOQQvBHbOALl7l9LegJSGmVY9e.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.706,\"height\":1464,\"iso_639_1\":\"sk\",\"file_path\":\"/rc8sRTYamBPNjEoL6WsBuTqp5mW.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1034},{\"aspect_ratio\":0.667,\"height\":1800,\"iso_639_1\":\"sk\",\"file_path\":\"/ibplTVmWaWCQ8TqFbmcJXBmuTtf.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1200},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"sk\",\"file_path\":\"/f3EpLs1CfyRIDW7LuFj3kvBGZ4N.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":2928,\"iso_639_1\":\"en\",\"file_path\":\"/zk4t5puCiXPvw2dwKBGUt4Hh977.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1952},{\"aspect_ratio\":0.667,\"height\":2100,\"iso_639_1\":\"tr\",\"file_path\":\"/lNur5DYuFHkjz19Y2auJ1sLEP5q.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1400},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"hu\",\"file_path\":\"/yBtDnvP3V4YY3K0u9IlyZdWyJA6.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/krAoSoir6XtvQYAqqRRHzC5Xhiv.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"es\",\"file_path\":\"/cB72WHqEKqHgV4P2z08aRqRVOvi.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":900,\"iso_639_1\":\"vi\",\"file_path\":\"/wBxkCbNI8eDRRfUEl8w0G2rfLyu.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":600},{\"aspect_ratio\":0.75,\"height\":853,\"iso_639_1\":\"en\",\"file_path\":\"/uA01tzxAfLDRRM5ZS3ethCdrqsJ.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":640},{\"aspect_ratio\":0.666,\"height\":2845,\"iso_639_1\":\"en\",\"file_path\":\"/lhkwaKzS9Y7ZEotyPwyQ7Ye2Dx5.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1895},{\"aspect_ratio\":0.75,\"height\":1333,\"iso_639_1\":\"fr\",\"file_path\":\"/dQqNAlqwwmxNyULZgQNvZENx2h7.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/fGkVDmJgrfvLtrDtYlCxwlkkSNY.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000}]}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "backdrops": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "aspect_ratio": {
                            "type": "number",
                            "example": 1.778,
                            "default": 0
                          },
                          "height": {
                            "type": "integer",
                            "example": 800,
                            "default": 0
                          },
                          "iso_639_1": {},
                          "file_path": {
                            "type": "string",
                            "example": "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg"
                          },
                          "vote_average": {
                            "type": "number",
                            "example": 5.622,
                            "default": 0
                          },
                          "vote_count": {
                            "type": "integer",
                            "example": 20,
                            "default": 0
                          },
                          "width": {
                            "type": "integer",
                            "example": 1422,
                            "default": 0
                          }
                        }
                      }
                    },
                    "id": {
                      "type": "integer",
                      "example": 550,
                      "default": 0
                    },
                    "logos": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "aspect_ratio": {
                            "type": "number",
                            "example": 5.203,
                            "default": 0
                          },
                          "height": {
                            "type": "integer",
                            "example": 79,
                            "default": 0
                          },
                          "iso_639_1": {
                            "type": "string",
                            "example": "he"
                          },
                          "file_path": {
                            "type": "string",
                            "example": "/c1KLulrIhUqY5fT42nmC5aERGCp.png"
                          },
                          "vote_average": {
                            "type": "number",
                            "example": 5.312,
                            "default": 0
                          },
                          "vote_count": {
                            "type": "integer",
                            "example": 1,
                            "default": 0
                          },
                          "width": {
                            "type": "integer",
                            "example": 411,
                            "default": 0
                          }
                        }
                      }
                    },
                    "posters": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "aspect_ratio": {
                            "type": "number",
                            "example": 0.667,
                            "default": 0
                          },
                          "height": {
                            "type": "integer",
                            "example": 900,
                            "default": 0
                          },
                          "iso_639_1": {
                            "type": "string",
                            "example": "pt"
                          },
                          "file_path": {
                            "type": "string",
                            "example": "/r3pPehX4ik8NLYPpbDRAh0YRtMb.jpg"
                          },
                          "vote_average": {
                            "type": "number",
                            "example": 5.258,
                            "default": 0
                          },
                          "vote_count": {
                            "type": "integer",
                            "example": 6,
                            "default": 0
                          },
                          "width": {
                            "type": "integer",
                            "example": 600,
                            "default": 0
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "deprecated": false
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true
}
```

# Networks
Images

# Images

Get the TV network logos by id.

> 📘 Note
>
> There are two image formats that are supported for companies, PNG's and SVG's. You can see which type the original file is by looking at the `file_type` field. We prefer SVG's as they are resolution independent and as such, the width and height are only there to reflect the original asset that was uploaded. An SVG can be scaled properly beyond those dimensions if you call them as a PNG.
>
> For more information about how SVG's and PNG's can be used, take a read through [this document](https://developer.themoviedb.org/docs/images).

# OpenAPI definition

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "tmdb-api",
    "version": "3"
  },
  "servers": [
    {
      "url": "https://api.themoviedb.org"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "apiKey",
        "in": "header",
        "name": "Authorization",
        "x-bearer-format": "bearer"
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/3/network/{network_id}/images": {
      "get": {
        "summary": "Images",
        "description": "Get the TV network logos by id.",
        "operationId": "alternative-names-copy",
        "parameters": [
          {
            "name": "network_id",
            "in": "path",
            "schema": {
              "type": "integer",
              "format": "int32"
            },
            "required": true
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\"id\":49,\"logos\":[{\"aspect_ratio\":2.425287356321839,\"file_path\":\"/tuomPhY2UtuPTqqFnKMVHvSb724.png\",\"height\":174,\"id\":\"5a7a67a40e0a26020a000091\",\"file_type\":\".svg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":422},{\"aspect_ratio\":2.424242424242424,\"file_path\":\"/hizvY65SpyF3BPY2qsBZMgUOxjs.png\",\"height\":495,\"id\":\"63e7979663aad200858726da\",\"file_type\":\".png\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1200}]}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "id": {
                      "type": "integer",
                      "example": 49,
                      "default": 0
                    },
                    "logos": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "aspect_ratio": {
                            "type": "number",
                            "example": 2.425287356321839,
                            "default": 0
                          },
                          "file_path": {
                            "type": "string",
                            "example": "/tuomPhY2UtuPTqqFnKMVHvSb724.png"
                          },
                          "height": {
                            "type": "integer",
                            "example": 174,
                            "default": 0
                          },
                          "id": {
                            "type": "string",
                            "example": "5a7a67a40e0a26020a000091"
                          },
                          "file_type": {
                            "type": "string",
                            "example": ".svg"
                          },
                          "vote_average": {
                            "type": "number",
                            "example": 5.318,
                            "default": 0
                          },
                          "vote_count": {
                            "type": "integer",
                            "example": 3,
                            "default": 0
                          },
                          "width": {
                            "type": "integer",
                            "example": 422,
                            "default": 0
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "deprecated": false
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true
}
```

# People

Images

# Images

Get the profile images that belong to a person.

This method will return the profile images that have been added to a person.

# OpenAPI definition

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "tmdb-api",
    "version": "3"
  },
  "servers": [
    {
      "url": "https://api.themoviedb.org"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "apiKey",
        "in": "header",
        "name": "Authorization",
        "x-bearer-format": "bearer"
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/3/person/{person_id}/images": {
      "get": {
        "summary": "Images",
        "description": "Get the profile images that belong to a person.",
        "operationId": "person-images",
        "parameters": [
          {
            "name": "person_id",
            "in": "path",
            "schema": {
              "type": "integer",
              "format": "int32"
            },
            "required": true
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"id\": 287,\n  \"profiles\": [\n    {\n      \"aspect_ratio\": 0.666,\n      \"height\": 980,\n      \"iso_639_1\": null,\n      \"file_path\": \"/cckcYc2v0yh1tc9QjRelptcOBko.jpg\",\n      \"vote_average\": 5.288,\n      \"vote_count\": 89,\n      \"width\": 653\n    },\n    {\n      \"aspect_ratio\": 0.667,\n      \"height\": 3000,\n      \"iso_639_1\": null,\n      \"file_path\": \"/eAOtKAc4p2C3DV8TGJQJzw8DeRv.jpg\",\n      \"vote_average\": 5.242,\n      \"vote_count\": 40,\n      \"width\": 2000\n    },\n    {\n      \"aspect_ratio\": 0.666,\n      \"height\": 1019,\n      \"iso_639_1\": null,\n      \"file_path\": \"/pynwU6PGLAdDE840rC9m6jEahWg.jpg\",\n      \"vote_average\": 5.198,\n      \"vote_count\": 7,\n      \"width\": 679\n    },\n    {\n      \"aspect_ratio\": 0.667,\n      \"height\": 1377,\n      \"iso_639_1\": null,\n      \"file_path\": \"/tJiSUYst4ddIaz1zge2LqCtu9tw.jpg\",\n      \"vote_average\": 5.16,\n      \"vote_count\": 42,\n      \"width\": 918\n    },\n    {\n      \"aspect_ratio\": 0.667,\n      \"height\": 2100,\n      \"iso_639_1\": null,\n      \"file_path\": \"/1k9MVNS9M3Y4KejBHusNdbGJwRw.jpg\",\n      \"vote_average\": 5.144,\n      \"vote_count\": 23,\n      \"width\": 1400\n    },\n    {\n      \"aspect_ratio\": 0.667,\n      \"height\": 721,\n      \"iso_639_1\": null,\n      \"file_path\": \"/ajNaPmXVVMJFg9GWmu6MJzTaXdV.jpg\",\n      \"vote_average\": 5.138,\n      \"vote_count\": 75,\n      \"width\": 481\n    },\n    {\n      \"aspect_ratio\": 0.667,\n      \"height\": 631,\n      \"iso_639_1\": null,\n      \"file_path\": \"/w1L55dXNi9UAmw2CURQjQI0DTf2.jpg\",\n      \"vote_average\": 5.134,\n      \"vote_count\": 47,\n      \"width\": 421\n    },\n    {\n      \"aspect_ratio\": 0.666,\n      \"height\": 1572,\n      \"iso_639_1\": null,\n      \"file_path\": \"/kU3B75TyRiCgE270EyZnHjfivoq.jpg\",\n      \"vote_average\": 5.128,\n      \"vote_count\": 71,\n      \"width\": 1047\n    },\n    {\n      \"aspect_ratio\": 0.666,\n      \"height\": 2000,\n      \"iso_639_1\": null,\n      \"file_path\": \"/uGlfGvB9DzmDaDYErPOZ9071sqt.jpg\",\n      \"vote_average\": 5.12,\n      \"vote_count\": 30,\n      \"width\": 1333\n    },\n    {\n      \"aspect_ratio\": 0.667,\n      \"height\": 1764,\n      \"iso_639_1\": null,\n      \"file_path\": \"/g23JKBtr0U46X9VPGjEgwxRG4Vs.jpg\",\n      \"vote_average\": 5.118,\n      \"vote_count\": 4,\n      \"width\": 1176\n    },\n    {\n      \"aspect_ratio\": 0.667,\n      \"height\": 900,\n      \"iso_639_1\": null,\n      \"file_path\": \"/gVtRLNr7MiASuGXO6UZfFBU9Ol4.jpg\",\n      \"vote_average\": 5.112,\n      \"vote_count\": 28,\n      \"width\": 600\n    },\n    {\n      \"aspect_ratio\": 0.667,\n      \"height\": 3000,\n      \"iso_639_1\": null,\n      \"file_path\": \"/oAvLuGuTaNcjY3R5huBQdfrZN6j.jpg\",\n      \"vote_average\": 5.096,\n      \"vote_count\": 24,\n      \"width\": 2000\n    },\n    {\n      \"aspect_ratio\": 0.667,\n      \"height\": 900,\n      \"iso_639_1\": null,\n      \"file_path\": \"/3UmLRKzI9fXONhyad2wdQ3JAKDO.jpg\",\n      \"vote_average\": 5.086,\n      \"vote_count\": 22,\n      \"width\": 600\n    },\n    {\n      \"aspect_ratio\": 0.671,\n      \"height\": 1200,\n      \"iso_639_1\": null,\n      \"file_path\": \"/k36ZQ6RLAr49uzSTd93qoLvcRZR.jpg\",\n      \"vote_average\": 4.908,\n      \"vote_count\": 35,\n      \"width\": 805\n    }\n  ]\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "id": {
                      "type": "integer",
                      "example": 287,
                      "default": 0
                    },
                    "profiles": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "aspect_ratio": {
                            "type": "number",
                            "example": 0.666,
                            "default": 0
                          },
                          "height": {
                            "type": "integer",
                            "example": 980,
                            "default": 0
                          },
                          "iso_639_1": {},
                          "file_path": {
                            "type": "string",
                            "example": "/cckcYc2v0yh1tc9QjRelptcOBko.jpg"
                          },
                          "vote_average": {
                            "type": "number",
                            "example": 5.288,
                            "default": 0
                          },
                          "vote_count": {
                            "type": "integer",
                            "example": 89,
                            "default": 0
                          },
                          "width": {
                            "type": "integer",
                            "example": 653,
                            "default": 0
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "deprecated": false
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true
}
```


# TV Series
Images

# Images

Get the images that belong to a TV series.

This method will return the backdrops, posters and logos that have been added to a TV show.

> 📘 Note
>
> If you have a `language` specified, it will act as a filter on the returned items. You can use the `include_image_language` param to query additional languages.

# OpenAPI definition

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "tmdb-api",
    "version": "3"
  },
  "servers": [
    {
      "url": "https://api.themoviedb.org"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "apiKey",
        "in": "header",
        "name": "Authorization",
        "x-bearer-format": "bearer"
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/3/tv/{series_id}/images": {
      "get": {
        "summary": "Images",
        "description": "Get the images that belong to a TV series.",
        "operationId": "tv-series-images",
        "parameters": [
          {
            "name": "series_id",
            "in": "path",
            "schema": {
              "type": "integer",
              "format": "int32"
            },
            "required": true
          },
          {
            "name": "include_image_language",
            "in": "query",
            "description": "specify a comma separated list of ISO-639-1 values to query, for example: `en-US,null`",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "language",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\"backdrops\":[{\"aspect_ratio\":1.778,\"height\":800,\"iso_639_1\":null,\"file_path\":\"/hZkgoQYus5vegHoetLkCJzb17zJ.jpg\",\"vote_average\":5.622,\"vote_count\":20,\"width\":1422},{\"aspect_ratio\":1.778,\"height\":720,\"iso_639_1\":\"en\",\"file_path\":\"/fygeMr16EcxJiYhdiO1LEr7iHtI.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":1280},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/b9HyPoxwxjxkWEUL5ErZdhApQe2.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1440,\"iso_639_1\":null,\"file_path\":\"/c6OLXfKAk5BKeR6broC8pYiCquX.jpg\",\"vote_average\":5.292,\"vote_count\":18,\"width\":2560},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/3nv2TEz2u178xPXzdKlZdUh5uOI.jpg\",\"vote_average\":5.276,\"vote_count\":12,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/yguBaPk5V0nZCcSBthre4YFMAgk.jpg\",\"vote_average\":5.212,\"vote_count\":11,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/xRyINp9KfMLVjRiO5nCsoRDdvvF.jpg\",\"vote_average\":5.206,\"vote_count\":9,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/bsfJoKVAqFzlhvbt8AffjvYAtN4.jpg\",\"vote_average\":5.19,\"vote_count\":5,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/kpRWGjh3SsYjuF26HyRhCJJkMRk.jpg\",\"vote_average\":5.19,\"vote_count\":5,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/5pxdgKVEDWDQBtvqIB2eB2oheml.jpg\",\"vote_average\":5.18,\"vote_count\":3,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":720,\"iso_639_1\":\"en\",\"file_path\":\"/yPeG1RQm5Am0eslu0IwUEJ4VXND.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1280},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/jAvY6IN6MIxmPM2oAtNqYK7P2gi.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1920},{\"aspect_ratio\":1.777,\"height\":793,\"iso_639_1\":null,\"file_path\":\"/52AfXWuXCHn3UjD17rBruA9f5qb.jpg\",\"vote_average\":5.146,\"vote_count\":10,\"width\":1409},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/ruJPyRrHYPS071XzVGPX3peYi0x.jpg\",\"vote_average\":5.146,\"vote_count\":10,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1439,\"iso_639_1\":null,\"file_path\":\"/rr7E0NoGKxvbkb89eR1GwfoYjpA.jpg\",\"vote_average\":5.144,\"vote_count\":23,\"width\":2559},{\"aspect_ratio\":1.778,\"height\":1964,\"iso_639_1\":null,\"file_path\":\"/8iVyhmjzUbvAGppkdCZPiyEHSoF.jpg\",\"vote_average\":5.138,\"vote_count\":8,\"width\":3492},{\"aspect_ratio\":1.778,\"height\":900,\"iso_639_1\":null,\"file_path\":\"/3qFgjOYLnEUfBxt5yWRKmRRrh9w.jpg\",\"vote_average\":5.138,\"vote_count\":8,\"width\":1600},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/eZRY604RqrnT2Yxz0GwGo7tRChX.jpg\",\"vote_average\":5.128,\"vote_count\":6,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/5OjjPVk14NZRp8N5UUS6k55hbfp.jpg\",\"vote_average\":5.118,\"vote_count\":4,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":2160,\"iso_639_1\":null,\"file_path\":\"/vxqKGixpgNndTz58YbFpTlw8lpB.jpg\",\"vote_average\":5.118,\"vote_count\":4,\"width\":3840},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/nHOaLyQeV9isvyxF7mMH2TUG8IK.jpg\",\"vote_average\":5.118,\"vote_count\":4,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/rv972EWgze3DZitMMY8AEDzD9HK.jpg\",\"vote_average\":5.118,\"vote_count\":4,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":2160,\"iso_639_1\":null,\"file_path\":\"/vfEuh0ELDkHWu3UfJiEkWN8Z4tc.jpg\",\"vote_average\":5.118,\"vote_count\":4,\"width\":3840},{\"aspect_ratio\":1.776,\"height\":1172,\"iso_639_1\":null,\"file_path\":\"/2SW1FZHZw4ncy61pb8jcgrzVQVk.jpg\",\"vote_average\":5.106,\"vote_count\":2,\"width\":2082},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/1lBuRNwlqUs4BeF7UR4RuAgp2KW.jpg\",\"vote_average\":5.106,\"vote_count\":2,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/7XEtHQoy1hwa8XWaOkSv3rlteea.jpg\",\"vote_average\":5.09,\"vote_count\":11,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/yrN6gon5NG6t7Lgh05byChFSZem.jpg\",\"vote_average\":5.08,\"vote_count\":9,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":720,\"iso_639_1\":null,\"file_path\":\"/qRNDy8RLjd7WAD8GGTBmzGAFFGF.jpg\",\"vote_average\":5.044,\"vote_count\":3,\"width\":1280},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/aKSnDPpYxaalpDkla9LyIzn2bjq.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/sty6obiES7ZMkEaCWt5dthRbvHT.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/9sxsHE74N1SXYpXzUEiO3PoDvan.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/o9PU3vpXhpl13qogQ8gLL30wH2Y.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/wRxE40hwcSWSkHUnj8zGMf5tnab.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/maCmEa61kG3cIvoCwdFtEbrJThT.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/mvvVcyJwj7n8iwgPsTFUWzc9N8L.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/tOciO9nqIZn1MbnMxu5Rweayd83.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/8KEWr4K6zyF77RDIqZAeMpi2MRV.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/fSJpyCCOPblKc2GHgTi682d7mqF.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/xJC7qhzgPJXEEi4EdAxYUF1WEGf.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1152,\"iso_639_1\":\"pt\",\"file_path\":\"/rCMuTyJGT2GJzXcvWeYAVHQQRFS.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2048},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":\"sv\",\"file_path\":\"/zSB4QpFOqQXGeugeKALCK7hoX68.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920}],\"id\":550,\"logos\":[{\"aspect_ratio\":5.203,\"height\":79,\"iso_639_1\":\"he\",\"file_path\":\"/c1KLulrIhUqY5fT42nmC5aERGCp.png\",\"vote_average\":5.312,\"vote_count\":1,\"width\":411},{\"aspect_ratio\":8.502,\"height\":235,\"iso_639_1\":\"pt\",\"file_path\":\"/qqAcl1YIT5Sa2nx8tKQcervQCco.png\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1998},{\"aspect_ratio\":4.638,\"height\":389,\"iso_639_1\":\"en\",\"file_path\":\"/7Uqhv24pGJs4Ns31NoOPWFJGWNG.png\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1804},{\"aspect_ratio\":1.329,\"height\":1275,\"iso_639_1\":\"en\",\"file_path\":\"/v7JwpiYf2knmf2R2mLLvJmNxy9x.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1694},{\"aspect_ratio\":0.848,\"height\":1295,\"iso_639_1\":\"en\",\"file_path\":\"/4XkF0Rf7gvSfea8fYLFbU5tmuJw.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1098},{\"aspect_ratio\":1.5,\"height\":290,\"iso_639_1\":\"en\",\"file_path\":\"/y9dOBfqWvCdxQcwBSPT2nfXGJpi.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":435},{\"aspect_ratio\":0.861,\"height\":294,\"iso_639_1\":\"en\",\"file_path\":\"/7s3aiqRnwRUVpwtxFLrWyMITHSC.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":253},{\"aspect_ratio\":1.324,\"height\":293,\"iso_639_1\":\"es\",\"file_path\":\"/xJe4B5TVXvjldcdlwlSgJ7PtjDu.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":388},{\"aspect_ratio\":2.134,\"height\":298,\"iso_639_1\":\"es\",\"file_path\":\"/z6yka0HngU3FPjcWBc4CSxokUg0.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":636},{\"aspect_ratio\":1.29,\"height\":310,\"iso_639_1\":\"en\",\"file_path\":\"/ahnGkBeGqvUtpyfOqoWt9Cto9WR.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":400},{\"aspect_ratio\":1.34,\"height\":300,\"iso_639_1\":\"en\",\"file_path\":\"/fI7UHnoU685iz4eG7lQu7aKfxPW.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":402},{\"aspect_ratio\":1.766,\"height\":295,\"iso_639_1\":\"en\",\"file_path\":\"/hfbxs6yi35ciD6xcuGz0eeHfpm9.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":521},{\"aspect_ratio\":0.868,\"height\":296,\"iso_639_1\":\"en\",\"file_path\":\"/ofkQTAMEY6N8MSiezFMxdQtej3o.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":257},{\"aspect_ratio\":2.209,\"height\":1298,\"iso_639_1\":\"pt\",\"file_path\":\"/5TVHz85ylbxt1jTbZ2DfPsKioX0.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2867},{\"aspect_ratio\":2.209,\"height\":1298,\"iso_639_1\":\"pt\",\"file_path\":\"/k8KZ4lH1GRNNJo6n8FZjCDTBIaL.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2867},{\"aspect_ratio\":1.382,\"height\":296,\"iso_639_1\":\"en\",\"file_path\":\"/a3YV8Fnue6LTuSRuvnLxvEPeZxz.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":409},{\"aspect_ratio\":3.365,\"height\":233,\"iso_639_1\":\"en\",\"file_path\":\"/yDcFmXCT4XUkTujDY3p1auO8Po5.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":784},{\"aspect_ratio\":1.371,\"height\":294,\"iso_639_1\":\"en\",\"file_path\":\"/mjrGAw5IyGQIYsJaqGIyxgvnfZj.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":403},{\"aspect_ratio\":2.085,\"height\":295,\"iso_639_1\":\"ru\",\"file_path\":\"/y9RSpK5PpMYEkfdCRofBp09KpW9.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":615},{\"aspect_ratio\":1.749,\"height\":299,\"iso_639_1\":\"es\",\"file_path\":\"/tYztBlJpIClYUznEI1G0mQWxoCO.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":523},{\"aspect_ratio\":2.103,\"height\":428,\"iso_639_1\":\"ru\",\"file_path\":\"/aj0TDYImCd1bd0woML4I5t3C2Qh.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":900},{\"aspect_ratio\":1.041,\"height\":244,\"iso_639_1\":\"en\",\"file_path\":\"/40uRxnaxKNIxZPVKVMizbe76a8h.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":254},{\"aspect_ratio\":1.474,\"height\":661,\"iso_639_1\":\"he\",\"file_path\":\"/nDZdalfIZ3v7vx56zHo3HtApGqG.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":974},{\"aspect_ratio\":1.332,\"height\":244,\"iso_639_1\":\"pt\",\"file_path\":\"/l8pqQ4bwdU8IkdAvEM2PVYjqYCT.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":325},{\"aspect_ratio\":1.472,\"height\":536,\"iso_639_1\":\"ro\",\"file_path\":\"/spz7zdPaSFQPicmSdCvpIzTwsHo.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":789},{\"aspect_ratio\":2.536,\"height\":304,\"iso_639_1\":\"pl\",\"file_path\":\"/dYd6n3eOlijsiX25OV3sfHqCF10.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":771},{\"aspect_ratio\":1.297,\"height\":538,\"iso_639_1\":\"th\",\"file_path\":\"/pHsyBpUS4uz288bpZtnCmPHYxmN.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":698},{\"aspect_ratio\":7.313,\"height\":297,\"iso_639_1\":\"hu\",\"file_path\":\"/oMV5afEbMOxh1nowR1tLxFpIEhH.png\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2172}],\"posters\":[{\"aspect_ratio\":0.667,\"height\":900,\"iso_639_1\":\"pt\",\"file_path\":\"/r3pPehX4ik8NLYPpbDRAh0YRtMb.jpg\",\"vote_average\":5.258,\"vote_count\":6,\"width\":600},{\"aspect_ratio\":0.667,\"height\":1350,\"iso_639_1\":\"ru\",\"file_path\":\"/66RvLrRJTm4J8l3uHXWF09AICol.jpg\",\"vote_average\":5.522,\"vote_count\":4,\"width\":900},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg\",\"vote_average\":5.504,\"vote_count\":46,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/a26cQPRhJPX6GbWfQbvZdrrp9j9.jpg\",\"vote_average\":5.46,\"vote_count\":25,\"width\":2000},{\"aspect_ratio\":0.706,\"height\":2834,\"iso_639_1\":\"en\",\"file_path\":\"/14Cs3sr6nus6QTHThldis8p4Nlm.jpg\",\"vote_average\":5.384,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":2100,\"iso_639_1\":\"tr\",\"file_path\":\"/yjMuqAyJUoQZGWsZ0vZuYj5inAR.jpg\",\"vote_average\":5.384,\"vote_count\":2,\"width\":1400},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"he\",\"file_path\":\"/7Tmjr0jgVj8hHcd3UJD6HIilMKM.jpg\",\"vote_average\":5.384,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pt\",\"file_path\":\"/ohXr0v9U0TfFu9IXbSDm5zoGV3R.jpg\",\"vote_average\":5.33,\"vote_count\":9,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":2100,\"iso_639_1\":\"es\",\"file_path\":\"/1yWmCAIGSVNuTOGyz9F48W9g1Ux.jpg\",\"vote_average\":5.326,\"vote_count\":7,\"width\":1400},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"ko\",\"file_path\":\"/eKZ07Ted7VHxQjbuZrRBFOamcKJ.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":1000},{\"aspect_ratio\":0.666,\"height\":1418,\"iso_639_1\":\"uk\",\"file_path\":\"/266SbE7HFsEbvprMagQyf19PDsn.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":945},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"es\",\"file_path\":\"/sgTAWJFaB2kBvdQxRGabYFiQqEK.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"es\",\"file_path\":\"/6HRbhpNd32STZ3QqtoRCuoow1EI.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"he\",\"file_path\":\"/d23jzgwz3G7CPBEj3gNusWmkd64.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1200,\"iso_639_1\":\"de\",\"file_path\":\"/rUPKPWBpr2ZbDXXZpT0qgYqTlG9.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":800},{\"aspect_ratio\":0.667,\"height\":2250,\"iso_639_1\":\"it\",\"file_path\":\"/rtNLQ8HbPElzEfrHjrzSr07prKT.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":1500},{\"aspect_ratio\":0.667,\"height\":750,\"iso_639_1\":\"pl\",\"file_path\":\"/efBb4gjjKneUoBVgfFOUu2OwihS.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":500},{\"aspect_ratio\":0.667,\"height\":2250,\"iso_639_1\":\"it\",\"file_path\":\"/xEAX4Hq21wZcRhspT7VyGtTspsp.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1500},{\"aspect_ratio\":0.667,\"height\":1620,\"iso_639_1\":\"ru\",\"file_path\":\"/8GJpI9jGsnJQ6wSnYTbddrbjsWB.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1080},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pt\",\"file_path\":\"/nu7FEmC4zBaZ7c3QYmVpDlZa2H0.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/6DFl63gJmQPxWBPRucHegEJ2Qns.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1200,\"iso_639_1\":\"en\",\"file_path\":\"/9VOESirK1bX66Xenj9QHcl5GJU9.jpg\",\"vote_average\":5.282,\"vote_count\":14,\"width\":800},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/jSziioSwPVrOy9Yow3XhWIBDjq1.jpg\",\"vote_average\":5.27,\"vote_count\":10,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pt\",\"file_path\":\"/mZDc9F3uNSgUNaudb1VtumPs3dL.jpg\",\"vote_average\":5.252,\"vote_count\":4,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"fr\",\"file_path\":\"/6NdNO1dq9w54ujk2G4sK4ogsf0H.jpg\",\"vote_average\":5.252,\"vote_count\":4,\"width\":1000},{\"aspect_ratio\":0.666,\"height\":1000,\"iso_639_1\":\"en\",\"file_path\":\"/b1ONg8Is4l760oryJa7Aw7LdPtM.jpg\",\"vote_average\":5.252,\"vote_count\":4,\"width\":666},{\"aspect_ratio\":0.701,\"height\":1426,\"iso_639_1\":\"en\",\"file_path\":\"/8kNruSfhk5IoE4eZOc4UpvDn6tq.jpg\",\"vote_average\":5.25,\"vote_count\":23,\"width\":1000},{\"aspect_ratio\":0.666,\"height\":1522,\"iso_639_1\":\"uk\",\"file_path\":\"/x43vYIPjcVvts7iHw6GH8sU1tiZ.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1014},{\"aspect_ratio\":0.721,\"height\":1020,\"iso_639_1\":\"he\",\"file_path\":\"/v7Y0dqAMYBsdkiPVM5btdNkhzmt.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":735},{\"aspect_ratio\":0.721,\"height\":1020,\"iso_639_1\":\"he\",\"file_path\":\"/nXZ5rghMvQayEGytShNxiLaEWLk.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":735},{\"aspect_ratio\":0.667,\"height\":2100,\"iso_639_1\":\"en\",\"file_path\":\"/obVTG7QMbQ7gV3oZAJuFjKBhsGk.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1400},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/uVe8UnJTgLso26NtA8GB4M0RDLh.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":2400,\"iso_639_1\":\"en\",\"file_path\":\"/dMgcjU3uaL9BhizmZbrGJsPQ8h4.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1600},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"de\",\"file_path\":\"/aRgu4CfNcCIHGOnbX81IPujQ3bO.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1000},{\"aspect_ratio\":0.698,\"height\":2865,\"iso_639_1\":\"ko\",\"file_path\":\"/uEsdm0noLfmkcVrZlyyuXp9e5I7.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"es\",\"file_path\":\"/6ZO199essPSa8taBHB4zLvOJLDD.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.669,\"height\":2278,\"iso_639_1\":\"en\",\"file_path\":\"/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg\",\"vote_average\":5.232,\"vote_count\":17,\"width\":1524},{\"aspect_ratio\":0.754,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/wR5HZWdVpcXx9sevV1bQi7rP4op.jpg\",\"vote_average\":5.212,\"vote_count\":11,\"width\":1131},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"es\",\"file_path\":\"/63j6sG0Q7GpLLNbGKgmFmAp7xT9.jpg\",\"vote_average\":5.198,\"vote_count\":7,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"es\",\"file_path\":\"/cm8dnS4MF3jtz0mvA9nEiDy0kxl.jpg\",\"vote_average\":5.19,\"vote_count\":5,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"es\",\"file_path\":\"/xfRCDSmdMQSISmLxI0r8hQ9GIQa.jpg\",\"vote_average\":5.19,\"vote_count\":5,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"es\",\"file_path\":\"/pOzC3JAt5kG6tJSNgp4N46T5QTI.jpg\",\"vote_average\":5.19,\"vote_count\":5,\"width\":2000},{\"aspect_ratio\":0.698,\"height\":1433,\"iso_639_1\":\"ko\",\"file_path\":\"/kabpExFv9JLp778w9ZtCtZnWH9N.jpg\",\"vote_average\":5.18,\"vote_count\":3,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":null,\"file_path\":\"/a1hxQhCl2i9DmbjKXixkukVW7zy.jpg\",\"vote_average\":5.18,\"vote_count\":3,\"width\":2000},{\"aspect_ratio\":0.711,\"height\":1066,\"iso_639_1\":\"pt\",\"file_path\":\"/8pcOlY6jaupFKTIy2aeKCKZ2GMj.jpg\",\"vote_average\":5.18,\"vote_count\":3,\"width\":758},{\"aspect_ratio\":0.666,\"height\":1066,\"iso_639_1\":\"pt\",\"file_path\":\"/lZcILaI9vvoCUVxl9KnUKeL6sKc.jpg\",\"vote_average\":5.18,\"vote_count\":3,\"width\":710},{\"aspect_ratio\":0.707,\"height\":1403,\"iso_639_1\":\"en\",\"file_path\":\"/wlmGPHDbnOK4AwL37m6tegxO8A3.jpg\",\"vote_average\":5.18,\"vote_count\":3,\"width\":992},{\"aspect_ratio\":0.667,\"height\":2100,\"iso_639_1\":\"en\",\"file_path\":\"/hPkAixiAyXzQb8uTOiovuhpDBK2.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1400},{\"aspect_ratio\":0.671,\"height\":1361,\"iso_639_1\":\"ko\",\"file_path\":\"/4quCAKpCylIy991IHkLCuXCzO1a.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":913},{\"aspect_ratio\":0.671,\"height\":1361,\"iso_639_1\":\"ko\",\"file_path\":\"/kZfIYkflKe52rbzUruBUIqX5KOV.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":913},{\"aspect_ratio\":0.667,\"height\":2400,\"iso_639_1\":\"en\",\"file_path\":\"/7Yl18M6LegCaMuwYDkEhohXsG1b.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1600},{\"aspect_ratio\":0.701,\"height\":1426,\"iso_639_1\":\"ta\",\"file_path\":\"/bo2IVEKV7BtHLHOWF1zfuqoHnfp.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":2400,\"iso_639_1\":\"en\",\"file_path\":\"/tcmNYC8ub4E51gkErXoIgkbESZH.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":1600},{\"aspect_ratio\":0.701,\"height\":1426,\"iso_639_1\":\"en\",\"file_path\":\"/k1lICEYRpJeFRIRfjxYwmpO9LTu.jpg\",\"vote_average\":5.128,\"vote_count\":6,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":2100,\"iso_639_1\":\"fr\",\"file_path\":\"/iqR0M1ln7Kobjp9liUj2Q7mtQZG.jpg\",\"vote_average\":5.118,\"vote_count\":4,\"width\":1400},{\"aspect_ratio\":0.698,\"height\":1433,\"iso_639_1\":\"ko\",\"file_path\":\"/5vgorfLOTe6w8Ti68s25kzXxjun.jpg\",\"vote_average\":5.106,\"vote_count\":2,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"es\",\"file_path\":\"/cp6PLg9gGItJBIQlnEfikqZMvah.jpg\",\"vote_average\":5.068,\"vote_count\":7,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1800,\"iso_639_1\":\"en\",\"file_path\":\"/fCTjGJxKWZGWQDCGFGYMGvh4VNP.jpg\",\"vote_average\":5.068,\"vote_count\":7,\"width\":1200},{\"aspect_ratio\":0.687,\"height\":1200,\"iso_639_1\":\"es\",\"file_path\":\"/974fFjwHSjMkZhH0HOZZcOyRM2h.jpg\",\"vote_average\":4.922,\"vote_count\":5,\"width\":824},{\"aspect_ratio\":0.706,\"height\":1000,\"iso_639_1\":\"be\",\"file_path\":\"/eKtuGJQJ06iafhYl22mYCWidjmM.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":706},{\"aspect_ratio\":0.667,\"height\":1800,\"iso_639_1\":null,\"file_path\":\"/fFkMxrBYnEBcEHotxTQwx2nAncy.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1200},{\"aspect_ratio\":0.667,\"height\":1800,\"iso_639_1\":\"hu\",\"file_path\":\"/74RcH5EIo9IrPIgsZw7mGd989tW.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1200},{\"aspect_ratio\":0.71,\"height\":1353,\"iso_639_1\":\"it\",\"file_path\":\"/4Fb5srk9F3jo561ig451r7O3EgR.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":960},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"cs\",\"file_path\":\"/nYtec2BxtcupGTdOMcIscG6rkhQ.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":2100,\"iso_639_1\":\"pt\",\"file_path\":\"/rwUtDfMvMQsGrjpyS27ASLlJ6J5.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1400},{\"aspect_ratio\":0.667,\"height\":1080,\"iso_639_1\":\"en\",\"file_path\":\"/A86dg5r6tdUVvQBeOGhvgTXGoQi.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":720},{\"aspect_ratio\":0.667,\"height\":2100,\"iso_639_1\":\"en\",\"file_path\":\"/m10ywT1Bnazwhccdymn6hap6Fmw.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1400},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/uwOQQvBHbOALl7l9LegJSGmVY9e.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.706,\"height\":1464,\"iso_639_1\":\"sk\",\"file_path\":\"/rc8sRTYamBPNjEoL6WsBuTqp5mW.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1034},{\"aspect_ratio\":0.667,\"height\":1800,\"iso_639_1\":\"sk\",\"file_path\":\"/ibplTVmWaWCQ8TqFbmcJXBmuTtf.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1200},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"sk\",\"file_path\":\"/f3EpLs1CfyRIDW7LuFj3kvBGZ4N.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":2928,\"iso_639_1\":\"en\",\"file_path\":\"/zk4t5puCiXPvw2dwKBGUt4Hh977.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1952},{\"aspect_ratio\":0.667,\"height\":2100,\"iso_639_1\":\"tr\",\"file_path\":\"/lNur5DYuFHkjz19Y2auJ1sLEP5q.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1400},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"hu\",\"file_path\":\"/yBtDnvP3V4YY3K0u9IlyZdWyJA6.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/krAoSoir6XtvQYAqqRRHzC5Xhiv.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"es\",\"file_path\":\"/cB72WHqEKqHgV4P2z08aRqRVOvi.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":900,\"iso_639_1\":\"vi\",\"file_path\":\"/wBxkCbNI8eDRRfUEl8w0G2rfLyu.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":600},{\"aspect_ratio\":0.75,\"height\":853,\"iso_639_1\":\"en\",\"file_path\":\"/uA01tzxAfLDRRM5ZS3ethCdrqsJ.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":640},{\"aspect_ratio\":0.666,\"height\":2845,\"iso_639_1\":\"en\",\"file_path\":\"/lhkwaKzS9Y7ZEotyPwyQ7Ye2Dx5.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1895},{\"aspect_ratio\":0.75,\"height\":1333,\"iso_639_1\":\"fr\",\"file_path\":\"/dQqNAlqwwmxNyULZgQNvZENx2h7.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/fGkVDmJgrfvLtrDtYlCxwlkkSNY.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000}]}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "backdrops": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "aspect_ratio": {
                            "type": "number",
                            "example": 1.778,
                            "default": 0
                          },
                          "height": {
                            "type": "integer",
                            "example": 800,
                            "default": 0
                          },
                          "iso_639_1": {},
                          "file_path": {
                            "type": "string",
                            "example": "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg"
                          },
                          "vote_average": {
                            "type": "number",
                            "example": 5.622,
                            "default": 0
                          },
                          "vote_count": {
                            "type": "integer",
                            "example": 20,
                            "default": 0
                          },
                          "width": {
                            "type": "integer",
                            "example": 1422,
                            "default": 0
                          }
                        }
                      }
                    },
                    "id": {
                      "type": "integer",
                      "example": 550,
                      "default": 0
                    },
                    "logos": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "aspect_ratio": {
                            "type": "number",
                            "example": 5.203,
                            "default": 0
                          },
                          "height": {
                            "type": "integer",
                            "example": 79,
                            "default": 0
                          },
                          "iso_639_1": {
                            "type": "string",
                            "example": "he"
                          },
                          "file_path": {
                            "type": "string",
                            "example": "/c1KLulrIhUqY5fT42nmC5aERGCp.png"
                          },
                          "vote_average": {
                            "type": "number",
                            "example": 5.312,
                            "default": 0
                          },
                          "vote_count": {
                            "type": "integer",
                            "example": 1,
                            "default": 0
                          },
                          "width": {
                            "type": "integer",
                            "example": 411,
                            "default": 0
                          }
                        }
                      }
                    },
                    "posters": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "aspect_ratio": {
                            "type": "number",
                            "example": 0.667,
                            "default": 0
                          },
                          "height": {
                            "type": "integer",
                            "example": 900,
                            "default": 0
                          },
                          "iso_639_1": {
                            "type": "string",
                            "example": "pt"
                          },
                          "file_path": {
                            "type": "string",
                            "example": "/r3pPehX4ik8NLYPpbDRAh0YRtMb.jpg"
                          },
                          "vote_average": {
                            "type": "number",
                            "example": 5.258,
                            "default": 0
                          },
                          "vote_count": {
                            "type": "integer",
                            "example": 6,
                            "default": 0
                          },
                          "width": {
                            "type": "integer",
                            "example": 600,
                            "default": 0
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "deprecated": false
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true
}
```

# TV Seasons
Images

# Images

Get the images that belong to a TV season.

This method will return the posters that have been added to a TV season.

> 📘 Note
>
> If you have a `language` specified, it will act as a filter on the returned items. You can use the `include_image_language` param to query additional languages.

# OpenAPI definition

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "tmdb-api",
    "version": "3"
  },
  "servers": [
    {
      "url": "https://api.themoviedb.org"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "apiKey",
        "in": "header",
        "name": "Authorization",
        "x-bearer-format": "bearer"
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/3/tv/{series_id}/season/{season_number}/images": {
      "get": {
        "summary": "Images",
        "description": "Get the images that belong to a TV season.",
        "operationId": "tv-season-images",
        "parameters": [
          {
            "name": "series_id",
            "in": "path",
            "schema": {
              "type": "integer",
              "format": "int32"
            },
            "required": true
          },
          {
            "name": "include_image_language",
            "in": "query",
            "description": "specify a comma separated list of ISO-639-1 values to query, for example: `en-US,null`",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "language",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "season_number",
            "in": "path",
            "schema": {
              "type": "integer",
              "format": "int32"
            },
            "required": true
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\"id\":3624,\"posters\":[{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/wgfKiqzuMrFIkU1M68DDDY8kGC1.jpg\",\"vote_average\":5.514,\"vote_count\":18,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"pt\",\"file_path\":\"/wNOdNgqoySuWbQk3F0QZjPKp8X7.jpg\",\"vote_average\":5.384,\"vote_count\":2,\"width\":1000},{\"aspect_ratio\":0.692,\"height\":578,\"iso_639_1\":\"en\",\"file_path\":\"/zwaj4egrhnXOBIit1tyb4Sbt3KP.jpg\",\"vote_average\":5.382,\"vote_count\":30,\"width\":400},{\"aspect_ratio\":0.667,\"height\":1425,\"iso_639_1\":\"en\",\"file_path\":\"/olJ6ivXxCMq3cfujo1IRw30OrsQ.jpg\",\"vote_average\":5.338,\"vote_count\":13,\"width\":950},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/qCOMbOrSeZ8n4Jur2GPCxpZsRgx.jpg\",\"vote_average\":5.326,\"vote_count\":7,\"width\":1000},{\"aspect_ratio\":0.666,\"height\":2164,\"iso_639_1\":\"es\",\"file_path\":\"/vQWuDXgmu1QNxmnUsfvusJVqNNO.jpg\",\"vote_average\":5.322,\"vote_count\":5,\"width\":1442},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"fr\",\"file_path\":\"/nzuu9H5De0zL687q2gmXxN9tfEQ.jpg\",\"vote_average\":5.322,\"vote_count\":5,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/f2VFinnHA1QRnZajVvLYOnuIjcO.jpg\",\"vote_average\":5.318,\"vote_count\":3,\"width\":1000},{\"aspect_ratio\":0.68,\"height\":1500,\"iso_639_1\":\"hu\",\"file_path\":\"/9Pf7Wf5b0FxGglMqnuoVD86XpmY.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1020},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"de\",\"file_path\":\"/ua3efTch7ktqu84M5j4GOiZHpSA.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.692,\"height\":578,\"iso_639_1\":\"pt\",\"file_path\":\"/7C2Fm2xi8DVJif2TtEKnbVtFJms.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":400},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/etbNjTy6WFgFXWLtwfIIgV0e7uV.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"he\",\"file_path\":\"/qmEXHnJRfBQmky9YeQnRV7Zq1Ln.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.675,\"height\":1481,\"iso_639_1\":\"en\",\"file_path\":\"/y0XaWR4Zg3Ynyi7Rm0ceNKY0EnX.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.701,\"height\":1426,\"iso_639_1\":\"pl\",\"file_path\":\"/pQ9SuE4ZztYxpGBxGKYtuqi6r3A.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"ru\",\"file_path\":\"/nRnTStI678B0wVEk5wDAPIyH7Fb.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"pl\",\"file_path\":\"/2IfkpYgqLf3klcUqFVFVPxeg9mA.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"it\",\"file_path\":\"/r6Qoa10PBMP6oc7bo8qjQbM8oPQ.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1000},{\"aspect_ratio\":0.701,\"height\":1426,\"iso_639_1\":\"fr\",\"file_path\":\"/zWWMRW6EI7y1uchdOx6zHucVDeP.jpg\",\"vote_average\":5.288,\"vote_count\":4,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/67o6EdiVBjx4l2qG88dk51VH7Du.jpg\",\"vote_average\":5.258,\"vote_count\":6,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"pt\",\"file_path\":\"/c3pUHUXVuuc0WbrepzAQbTUfnuI.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/fY9SToqac7bjqLczawuc7kLmX74.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"fr\",\"file_path\":\"/ru8Xa0mFaN04w2HYYybDxwcTSTX.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"es\",\"file_path\":\"/xO4SPfQ8FycNjXM8v43dPwPyuKG.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"fr\",\"file_path\":\"/ol7cqrxcyfGvYQCcFFwqq3JOskE.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":2000},{\"aspect_ratio\":0.701,\"height\":1100,\"iso_639_1\":\"es\",\"file_path\":\"/uAWrtCFIJo6gUweHwuSSqRILaIX.jpg\",\"vote_average\":5.19,\"vote_count\":5,\"width\":771},{\"aspect_ratio\":0.692,\"height\":578,\"iso_639_1\":\"he\",\"file_path\":\"/pFeiYLByZfxyso9Nt2NGLMxjDq7.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":400},{\"aspect_ratio\":0.692,\"height\":578,\"iso_639_1\":\"es\",\"file_path\":\"/rn34iJhmKbqx9G5ntULWvA5tKxN.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":400},{\"aspect_ratio\":0.667,\"height\":1425,\"iso_639_1\":\"pt\",\"file_path\":\"/s1XTuOQHo8ZxvETfqMj7chAydCW.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":950},{\"aspect_ratio\":0.68,\"height\":1000,\"iso_639_1\":\"he\",\"file_path\":\"/gcFD5p25dN66RhdW5nRJMBlZTvn.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":680},{\"aspect_ratio\":0.675,\"height\":1000,\"iso_639_1\":\"he\",\"file_path\":\"/grrs3Pg0IRpTcNib3TggKdVuKvu.jpg\",\"vote_average\":5.172,\"vote_count\":1,\"width\":675},{\"aspect_ratio\":0.732,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/lQk5IqlJjwYjHQv85dxH9xHbJow.jpg\",\"vote_average\":5.118,\"vote_count\":4,\"width\":1098},{\"aspect_ratio\":0.692,\"height\":578,\"iso_639_1\":\"en\",\"file_path\":\"/ed7V8LH6hRS3DGtBosDteKWJ5tU.jpg\",\"vote_average\":5.106,\"vote_count\":2,\"width\":400},{\"aspect_ratio\":0.692,\"height\":578,\"iso_639_1\":\"en\",\"file_path\":\"/uGVsfs5v7WBIs09uZRTx0lj8vmM.jpg\",\"vote_average\":5.044,\"vote_count\":3,\"width\":400},{\"aspect_ratio\":0.692,\"height\":578,\"iso_639_1\":\"en\",\"file_path\":\"/nDkc1E5fyTty2s7m0kUutDWPSS3.jpg\",\"vote_average\":5.044,\"vote_count\":3,\"width\":400},{\"aspect_ratio\":0.692,\"height\":578,\"iso_639_1\":\"en\",\"file_path\":\"/rWH1n6iN75EFCZvamLwgn8byKkA.jpg\",\"vote_average\":5.044,\"vote_count\":3,\"width\":400},{\"aspect_ratio\":0.692,\"height\":578,\"iso_639_1\":\"en\",\"file_path\":\"/63UUxwknEYO3MyBhMJHUqgz1ud0.jpg\",\"vote_average\":5.0,\"vote_count\":7,\"width\":400},{\"aspect_ratio\":0.692,\"height\":578,\"iso_639_1\":\"en\",\"file_path\":\"/zLdRX76eQu2dJJfTW3EX0hvxfOW.jpg\",\"vote_average\":4.982,\"vote_count\":4,\"width\":400},{\"aspect_ratio\":0.692,\"height\":578,\"iso_639_1\":\"fr\",\"file_path\":\"/f9fOBlVpYngitJNc3dGVLtM0xXB.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":400},{\"aspect_ratio\":0.692,\"height\":578,\"iso_639_1\":\"hu\",\"file_path\":\"/3OyjrV1c1Irz55Wzk0DtNyr5rpA.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":400},{\"aspect_ratio\":0.701,\"height\":2160,\"iso_639_1\":\"fr\",\"file_path\":\"/A89p2D7Yg62odH2O9c3euVC0omz.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1515},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"cs\",\"file_path\":\"/aylKHznpdRON3RsZJWUoYDnnAPk.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"it\",\"file_path\":\"/ygPnYtVXB2eP7TnPsp4soaeoDKJ.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"cs\",\"file_path\":\"/8VaUV6Mq2hS2m9kjRHkFFjNsjZh.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.701,\"height\":1426,\"iso_639_1\":\"pl\",\"file_path\":\"/l3hkhWPgvyrx3wdUJ869QTHQsmw.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1425,\"iso_639_1\":\"en\",\"file_path\":\"/96bzkgUZK3NcVhrgf6bEGKxRnsD.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":950},{\"aspect_ratio\":0.701,\"height\":1426,\"iso_639_1\":\"ru\",\"file_path\":\"/q7IM5BNfhmYrS2hedohiYK6yUf0.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.703,\"height\":1758,\"iso_639_1\":\"es\",\"file_path\":\"/2JVyPqAAsIzyYYSGYpqzK0Olv9O.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1236},{\"aspect_ratio\":0.666,\"height\":802,\"iso_639_1\":\"uk\",\"file_path\":\"/gxQffFM6FrGqnWXJpLrNp1jRe1l.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":534},{\"aspect_ratio\":0.699,\"height\":1448,\"iso_639_1\":\"hu\",\"file_path\":\"/vMds2SxuwJggbtpFsBAsIz8pKUU.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1012},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":\"en\",\"file_path\":\"/2v619NAr3taUnnvzYjMWNr48uEx.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"fr\",\"file_path\":\"/gdjsE5hDw2MgOY3FntqtbGAHb75.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":640,\"iso_639_1\":\"fr\",\"file_path\":\"/y2lCrkfC2Z3E3n0yjJcoqyGQH6S.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":427},{\"aspect_ratio\":0.675,\"height\":640,\"iso_639_1\":null,\"file_path\":\"/pazxWyvgHiIINsVMdxwQQ3cfSeI.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":432},{\"aspect_ratio\":0.667,\"height\":640,\"iso_639_1\":null,\"file_path\":\"/xmIrKRXIxB7EUF20GdiJ7DN6wYy.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":427},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":null,\"file_path\":\"/6bIdPnvvTx4xzygrUePKRS5xse2.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.681,\"height\":640,\"iso_639_1\":null,\"file_path\":\"/6J0C7P5RiitwniPas8oKtSTLN4v.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":436},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":\"en\",\"file_path\":\"/5EfpcMHFmAz8zNz2pIcYonQRIaR.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.667,\"height\":1080,\"iso_639_1\":\"ko\",\"file_path\":\"/270a9YZzwtMRR8DjkuQgX2Np2o3.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":720},{\"aspect_ratio\":0.667,\"height\":3000,\"iso_639_1\":null,\"file_path\":\"/7UoNtzKS5rN8U1DqWezUMQjfbGT.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":2000},{\"aspect_ratio\":0.667,\"height\":1500,\"iso_639_1\":null,\"file_path\":\"/j4j9whw4xlKkKPsqCmkb0zpJnfQ.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1000},{\"aspect_ratio\":0.679,\"height\":1236,\"iso_639_1\":\"en\",\"file_path\":\"/orv6oSMQwbeFd4SXTz6JdonDiwl.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":839}]}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "id": {
                      "type": "integer",
                      "example": 3624,
                      "default": 0
                    },
                    "posters": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "aspect_ratio": {
                            "type": "number",
                            "example": 0.667,
                            "default": 0
                          },
                          "height": {
                            "type": "integer",
                            "example": 1500,
                            "default": 0
                          },
                          "iso_639_1": {
                            "type": "string",
                            "example": "en"
                          },
                          "file_path": {
                            "type": "string",
                            "example": "/wgfKiqzuMrFIkU1M68DDDY8kGC1.jpg"
                          },
                          "vote_average": {
                            "type": "number",
                            "example": 5.514,
                            "default": 0
                          },
                          "vote_count": {
                            "type": "integer",
                            "example": 18,
                            "default": 0
                          },
                          "width": {
                            "type": "integer",
                            "example": 1000,
                            "default": 0
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "deprecated": false
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true
}
```

# TV Episodes
Images

# Images

Get the images that belong to a TV episode.

This method will return the backdrops that have been added to a TV episode.

> 📘 Note
>
> If you have a `language` specified, it will act as a filter on the returned items. You can use the `include_image_language` param to query additional languages.

# OpenAPI definition

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "tmdb-api",
    "version": "3"
  },
  "servers": [
    {
      "url": "https://api.themoviedb.org"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "apiKey",
        "in": "header",
        "name": "Authorization",
        "x-bearer-format": "bearer"
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/3/tv/{series_id}/season/{season_number}/episode/{episode_number}/images": {
      "get": {
        "summary": "Images",
        "description": "Get the images that belong to a TV episode.",
        "operationId": "tv-episode-images",
        "parameters": [
          {
            "name": "series_id",
            "in": "path",
            "schema": {
              "type": "integer",
              "format": "int32"
            },
            "required": true
          },
          {
            "name": "include_image_language",
            "in": "query",
            "description": "specify a comma separated list of ISO-639-1 values to query, for example: `en-US,null`",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "language",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "season_number",
            "in": "path",
            "schema": {
              "type": "integer",
              "format": "int32"
            },
            "required": true
          },
          {
            "name": "episode_number",
            "in": "path",
            "schema": {
              "type": "integer",
              "format": "int32"
            },
            "required": true
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\"id\":63056,\"stills\":[{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/9hGF3WUkBf7cSjMg0cdMDHJkByd.jpg\",\"vote_average\":5.454,\"vote_count\":3,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/xIfvIM7YgkADTrqp23rm3CLaOVQ.jpg\",\"vote_average\":5.322,\"vote_count\":5,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/wrGWeW4WKxnaeA8sxJb2T9O6ryo.jpg\",\"vote_average\":5.32,\"vote_count\":7,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/qYqCWKoiyR845nUOotJ7rKIXGPM.jpg\",\"vote_average\":5.312,\"vote_count\":1,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/pyp0LgtqjgaeXzPMtXKnkuNBugV.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/w85NsRYgZQZrICE1kC9q8F2D6wS.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/g0OnOaBqSepbA8omNTfYBCl4Sbo.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/v3bGMbT5Ik86ERFBfsXFqpiMTFy.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/uaSOtAsNrXbKxOVzC31GjYxLRXJ.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/gDOWFhBTkuwhLKrFqpd7yhAwxVH.jpg\",\"vote_average\":5.246,\"vote_count\":2,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/9o3HXUmWaZq14tIAbBrn7e34NRZ.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":1080,\"iso_639_1\":null,\"file_path\":\"/wZPID3NddTuH7lBNgsFEiXWB6Bj.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":1920},{\"aspect_ratio\":1.778,\"height\":2160,\"iso_639_1\":null,\"file_path\":\"/lYQyyPoFpFBWQ9cta2zcfZE1axn.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":3840},{\"aspect_ratio\":1.778,\"height\":2160,\"iso_639_1\":null,\"file_path\":\"/nDkA929hW9ePdyvNure6Q0fNBWo.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":3840},{\"aspect_ratio\":1.778,\"height\":2160,\"iso_639_1\":null,\"file_path\":\"/ecDSsfUAgH9VqtdtaDdO2fi5KMF.jpg\",\"vote_average\":0.0,\"vote_count\":0,\"width\":3840}]}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "id": {
                      "type": "integer",
                      "example": 63056,
                      "default": 0
                    },
                    "stills": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "aspect_ratio": {
                            "type": "number",
                            "example": 1.778,
                            "default": 0
                          },
                          "height": {
                            "type": "integer",
                            "example": 1080,
                            "default": 0
                          },
                          "iso_639_1": {},
                          "file_path": {
                            "type": "string",
                            "example": "/9hGF3WUkBf7cSjMg0cdMDHJkByd.jpg"
                          },
                          "vote_average": {
                            "type": "number",
                            "example": 5.454,
                            "default": 0
                          },
                          "vote_count": {
                            "type": "integer",
                            "example": 3,
                            "default": 0
                          },
                          "width": {
                            "type": "integer",
                            "example": 1920,
                            "default": 0
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "deprecated": false
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true
}
```