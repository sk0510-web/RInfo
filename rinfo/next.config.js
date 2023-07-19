module.exports = {
    async rewrites() {
      return [
        {
          source: '/api/hotpeper.js/:id',
          destination: 'http://webservice.recruit.co.jp/hotpepper/gourmet/v1', // 実際のAPIエンドポイントに設定する
        },
      ];
    },
  };
