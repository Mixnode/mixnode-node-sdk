module.exports = {
  dummyQueryObject: {
    object: 'query',
    query_id: '83a423e7c7588e5e6a',
    query_str: 'SELECT url from pages LIMIT 5',
    status: 'PLANNING',
    error_msg: null,
    created_ts: 1551497624,
    ended_ts: 0,
    input_limit: 1073741824,
    data_scanned: 0,
    rows_scanned: 0,
    output_size: 0,
    output_rows: 0,
    results_download_url: 'https://www.mixnode.com/download-results?query_id=83a423e7c7588e5e6a&expires=1551504824&signature=8363c37c12eb686a078932715d816319',
    'webhook_url,': null
  },
  dummyPage1Response: {
    status: 'PLANNING',
    error_msg: null,
    next_page: 'https:\/\/api.mixnode.com\/queries\/83a423e7c7588e5e6a\/results\/2',
    columns: [],
    rows: []
  },
  dummyPage2Response: {
    status: 'FINISHED',
    error_msg: null,
    columns: [{
        name: 'url',
        type: 'varchar',
        typeSignature: {
          rawType: 'varchar',
          typeArguments: [],
          literalArguments: [],
          arguments: [{
              kind: 'LONG_LITERAL',
              value: 2147483647
            }
          ]
        }
      }
    ],
    rows: [['http://www.zzshhgcp.com/'], ['http://minecraft.zyczu.pl/']]
  }
};
