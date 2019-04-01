/* eslint-env jasmine */

const Mixnode = require('./../../src/index');
const config = require('./../test.config.js');
const MixnodeData = require('./../assets/MixnodeData.json');

const query = 'SELECT * from homepages LIMIT 5';

describe('Functions are defined', () => {
    let SQLClient;

    beforeEach(() => {
      SQLClient = new Mixnode.SQLClient(config);
    });

    it('Mixnode setDebug is defined', () => {
        expect(Mixnode.setDebug).toBeDefined();
    });

    it('SQLClient execute is defined', () => {
        expect(SQLClient.execute).toBeDefined();
    });

    it('SQLClient execute should call apiClient callApi method and return correct response', (done) => {
      spyOn(SQLClient.apiClient, 'callApi').and.returnValue(Promise.resolve(MixnodeData));
      SQLClient.execute(query)
      .then((resp) => {
        expect(SQLClient.apiClient.callApi).toHaveBeenCalled();
        expect(resp).toEqual(MixnodeData);
        done();
      });
    });

    it('SQLClient execute should call apiClient with correct parameters - query', (done) => {
      spyOn(SQLClient.apiClient, 'callApi').and.returnValue(Promise.resolve(MixnodeData));
      SQLClient.execute(query)
      .then((resp) => {
        expect(SQLClient.apiClient.callApi).toHaveBeenCalledWith('/queries', 'POST',
         { query_str: query }, { api_key: `${config.api_key}:` }, {});
        done();
      });
    });

    it('SQLClient execute should call apiClient with correct parameters - query, vars - 1', (done) => {
      spyOn(SQLClient.apiClient, 'callApi').and.returnValue(Promise.resolve(MixnodeData));
      const columns = ['url', 'url_domain'];
      const query = 'SELECT ?? from ?? where ?? = ? LIMIT 10';
      const vars = [columns, 'homepages', 'url_domain', 'cnn.com'];
      const formattedQuery = 'SELECT "url", "url_domain" from "homepages" where "url_domain" = \'cnn.com\' LIMIT 10';
      SQLClient.execute(query, vars)
      .then((resp) => {
        expect(SQLClient.apiClient.callApi).toHaveBeenCalledWith('/queries', 'POST',
         { query_str: formattedQuery }, { api_key: `${config.api_key}:` }, {});
        done();
      });
    });

    it('SQLClient execute should call apiClient with correct parameters - query, vars - 2', (done) => {
      spyOn(SQLClient.apiClient, 'callApi').and.returnValue(Promise.resolve(MixnodeData));
      const query = "SELECT css_text_first(??, 'h1#firstHeading') "
             + 'as title, ?? from ?? where ?? = ?  '
             + "and contains_any(content, array['href=\"https://www.bbc.com']) "
             + 'LIMIT 10';

      const vars = ['content', 'url', 'homepages', 'url_domain', 'wikipedia.org'];
      const formattedQuery = 'SELECT css_text_first("content", \'h1#firstHeading\') as title, "url" from "homepages" where "url_domain" = \'wikipedia.org\'  and contains_any(content, array[\'href="https://www.bbc.com\']) LIMIT 10';
      SQLClient.execute(query, vars)
      .then((resp) => {
        expect(SQLClient.apiClient.callApi).toHaveBeenCalledWith('/queries', 'POST',
         { query_str: formattedQuery }, { api_key: `${config.api_key}:` }, {});
        done();
      });
    });

    it('SQLClient execute should call apiClient with correct parameters - query, vars, input_limit', (done) => {
      spyOn(SQLClient.apiClient, 'callApi').and.returnValue(Promise.resolve(MixnodeData));
      const inputLimit = 123123123 * 12;
      SQLClient.execute(query, [], inputLimit)
      .then((resp) => {
        expect(SQLClient.apiClient.callApi).toHaveBeenCalledWith('/queries', 'POST',
         { query_str: query, input_limit: inputLimit }, { api_key: `${config.api_key}:` }, {});
        done();
      });
    });

    it('SQLClient execute should call apiClient with correct parameters - query, input_limit', (done) => {
      spyOn(SQLClient.apiClient, 'callApi').and.returnValue(Promise.resolve(MixnodeData));
      const inputLimit = 123123123 * 12;
      SQLClient.execute(query, inputLimit)
      .then((resp) => {
        expect(SQLClient.apiClient.callApi).toHaveBeenCalledWith('/queries', 'POST',
         { query_str: query, input_limit: inputLimit }, { api_key: `${config.api_key}:` }, {});
        done();
      });
    });

    it('SQLClient execute should call apiClient with correct parameters - query, input_limit, timeout', (done) => {
      spyOn(SQLClient.apiClient, 'callApi').and.returnValue(Promise.resolve(MixnodeData));
      const inputLimit = 123123123 * 12;
      const oOptions = { timeout: 100000 };
      SQLClient.execute(query, inputLimit, oOptions)
      .then((resp) => {
        expect(SQLClient.apiClient.callApi).toHaveBeenCalledWith('/queries', 'POST',
         { query_str: query, input_limit: inputLimit }, { api_key: `${config.api_key}:` }, oOptions);
        done();
      });
    });

    it('SQLClient execute should call apiClient with correct parameters - query, timeout', (done) => {
      spyOn(SQLClient.apiClient, 'callApi').and.returnValue(Promise.resolve(MixnodeData));
      const oOptions = { timeout: 100000 };
      SQLClient.execute(query, oOptions)
      .then((resp) => {
        expect(SQLClient.apiClient.callApi).toHaveBeenCalledWith('/queries', 'POST',
         { query_str: query }, { api_key: `${config.api_key}:` }, oOptions);
        done();
      });
    });

    it('SQLClient execute should call apiClient with correct parameters - query, vars, timeout', (done) => {
      spyOn(SQLClient.apiClient, 'callApi').and.returnValue(Promise.resolve(MixnodeData));
      const columns = ['url', 'url_domain'];
      const query = 'SELECT ?? from ?? where ?? = ? LIMIT 10';
      const vars = [columns, 'homepages', 'url_domain', 'cnn.com'];
      const oOptions = { timeout: 100000 };
      const formattedQuery = 'SELECT "url", "url_domain" from "homepages" where "url_domain" = \'cnn.com\' LIMIT 10';
      SQLClient.execute(query, vars, oOptions)
      .then((resp) => {
        expect(SQLClient.apiClient.callApi).toHaveBeenCalledWith('/queries', 'POST',
         { query_str: formattedQuery }, { api_key: `${config.api_key}:` }, oOptions);
        done();
      });
    });

    it('SQLClient execute should call apiClient with correct parameters - query, vars, input_limit, timeout', (done) => {
      spyOn(SQLClient.apiClient, 'callApi').and.returnValue(Promise.resolve(MixnodeData));
      const columns = ['url', 'url_domain'];
      const inputLimit = 123123123 * 12;
      const query = 'SELECT ?? from ?? where ?? = ? LIMIT 10';
      const vars = [columns, 'homepages', 'url_domain', 'cnn.com'];
      const oOptions = { timeout: 100000 };
      const formattedQuery = 'SELECT "url", "url_domain" from "homepages" where "url_domain" = \'cnn.com\' LIMIT 10';
      SQLClient.execute(query, vars, inputLimit, oOptions)
      .then((resp) => {
        expect(SQLClient.apiClient.callApi).toHaveBeenCalledWith('/queries', 'POST',
         { query_str: formattedQuery, input_limit: inputLimit }, { api_key: `${config.api_key}:` }, oOptions);
        done();
      });
    });

    it('Missing query check', (done) => {
      spyOn(SQLClient.apiClient, 'callApi').and.returnValue(Promise.resolve(MixnodeData));
      SQLClient.execute()
      .catch((err) => {
        expect(err).toBeDefined();
        expect(err.name).toEqual('Mixnode: MissingQuery Error');
        done();
      });
    });
});

describe('SQLClient instantiation errors', () => {
  it('Missing configuration error', () => {
      try {
        const SQLClient = new Mixnode.SQLClient();
      } catch (exception) {
        expect(exception.name).toEqual('Mixnode: MissingConfiguration Error');
      }
  });

  it('Missing api key error', () => {
      try {
        const SQLClient = new Mixnode.SQLClient({});
      } catch (exception) {
        expect(exception.name).toEqual('Mixnode: MissingApiKey Error');
      }
  });
});
