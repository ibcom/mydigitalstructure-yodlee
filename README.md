mydigitalstructure nodejs Connector for Yodlee
==============================================

Uses the mydigitalstructure nodejs SDK and the Yodlee SDK to get transactions from the bank and loaded into mydigitalstructure using http://docs.mydigitalstructure.com/FINANCIAL_BANK_ACCOUNT_TRANSACTION_MANAGE.

Resources
=========

https://developer.api.yodlee.com/ysl/restserver/v1/

1. Craig Richardson: https://github.com/craigrich/yodlee
2. https://www.npmjs.com/package/yodlee-transactions


Request
=======

{"url":"https://developer.api.yodlee.com/ysl/restserver/v1/transactions","method":"GET","headers":{"User-Agent":"Mozilla/5.0","Content-Type":"application/json; charset=utf-8","Authorization":"userSession=08062013_1:76938274abe3b24dd9dcc65ee490d0e4537f3e80eb48b0df2079e22b7ae8d3b079ce4b6339e40f429352cf608572151ddf23791ad118b41759e01ad12ae66c35, cobSession=08062013_1:e87cc08901960c1932afd30f07945a98fee36212029479c35cbf2f39fdce6f304fec1386a92116a3eec541aada099d5e3611577b001356bb0c908888e6ddee23"},"form":"","json":{"user":{"loginName":"sbMemdev.biziio2","password":"sbMemdev.biziio2#123","locale":"en_US"}}}