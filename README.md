mydigitalstructure nodejs Connector for Yodlee
==============================================

Uses the mydigitalstructure nodejs SDK and the Yodlee SDK to get transactions from the bank and loaded into mydigitalstructure using http://docs.mydigitalstructure.com/FINANCIAL_BANK_ACCOUNT_TRANSACTION_MANAGE.

Designed to run on node and AWS lambda

See:
http://docs.mydigitalstructure.com/gettingstarted_financial_transactions
http://docs.mydigitalstructure.com/gettingstarted_nodejs

Use:
https://www.npmjs.com/package/aws-lambda-local

`lambda-local -f app.js -c settings-private.json -t 300`

Import flow
===========

source: Yodlee
destination: mydigitalstructure

```
app.import.prepare.destination.users
```

```
app.import.start
```
```
app.import.sync
```

```
app.\_util.yodlee.logon
```

```
app.import.process.destination.switchSpace
```

```
app.import.prepare.source.accounts:
For logged on Yodlee user get linked bank accounts
```

```
app.import.prepare.destination.accounts
```

```
app.import.process.source.accounts.init
```

```
app.import.process.source.accounts.sync
```

```
app.import.prepare.destination.sources
```

```
app.import.prepare.source.transactions
```

```
app.import.process.destination.sources
```

```
app.import.prepare.destination.transactions
Get to protect against duplicates
```

```
app.import.process.destination.transactions.init
Match to check not in destination based on externalid
```

```
app.import.process.destination.transactions.send
```

```
app.import.process.destination.transactions.finalise
```

```
app.import.process.destination.transactions.done
```

```
app.import.process.source.accounts.sync
```

Yodlee User Access
==================

FINANCIAL_BANK_ACCOUNT_SEARCH
accessmethod:340
canadd:N
canremove:N
canupdate:N
canuse:Y

FINANCIAL_BANK_ACCOUNT_TRANSACTION_SOURCE_SEARCH
accessmethod:632
canadd:N
canremove:N
canupdate:N
canuse:Y

FINANCIAL_BANK_ACCOUNT_TRANSACTION_SEARCH
accessmethod:629
canadd:N
canremove:N
canupdate:N
canuse:Y

FINANCIAL_BANK_ACCOUNT_TRANSACTION_SOURCE_MANAGE
accessmethod:633
canadd:Y
canremove:Y
canupdate:Y
canuse:N

FINANCIAL_BANK_ACCOUNT_TRANSACTION_MANAGE
accessmethod:635
canadd:Y
canremove:Y
canupdate:Y
canuse:N

