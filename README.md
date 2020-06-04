# KISS XML JSON Mapper

Takes an JSON definition ...

```json5
{
  "soapenv:Envelope|envelope": {
    "soapenv:Header|header" : {
      "ebl:RequesterCredentials|credentials": {
        "ebl:NotificationSignature|signature": "string"
      }
    },
    "soapenv:Body|body" : {
      "GetItemResponse|content": {
        "Timestamp|timestamp": "datetime",
        "Item|item": {
          "BuyerProtection|buyerProtection": "string",
          "Description|description": "string"
        }
      }
    }
  }
}
```

And an XML document ...

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <soapenv:Header>
        <ebl:RequesterCredentials soapenv:mustUnderstand="0" xmlns:ns="urn:ebay:apis:eBLBaseComponents" xmlns:ebl="urn:ebay:apis:eBLBaseComponents">
            <ebl:NotificationSignature xmlns:ebl="urn:ebay:apis:eBLBaseComponents">2MMvMmzJ1WW3UJkmesy5/g==</ebl:NotificationSignature>
        </ebl:RequesterCredentials>
    </soapenv:Header>
    <soapenv:Body>
        <GetItemResponse xmlns="urn:ebay:apis:eBLBaseComponents">
            <Timestamp>2020-05-16T14:33:44.328Z</Timestamp>
            <Ack>Success</Ack>
            <CorrelationID>755553470</CorrelationID>
            <Version>1143</Version>
            <Build>E1143_CORE_APIMSG_19169581_R1</Build>
            <NotificationEventName>BidReceived</NotificationEventName>
            <RecipientUserID>testuser_granson</RecipientUserID>
            <EIASToken>nY+sHZ2PrBmdj6wVnY+sEZ2PrA2dj6wFk4aiC5OHqASdj6x9nY+seQ==</EIASToken>
            <Item>
                <AutoPay>false</AutoPay>
                <BuyerProtection>ItemIneligible</BuyerProtection>
                <BuyItNowPrice currencyID="USD">18.0</BuyItNowPrice>
                <Country>US</Country>
                <Currency>USD</Currency>
                <Description>
                    This is the fourth book in the Harry Potter series. In excellent condition!
                </Description>
            </Item>
        </GetItemResponse>
    </soapenv:Body>
</soapenv:Envelope>
```
And returns ...
```json5
{
  "envelope": {
    "header" : {
      "credentials": {
        "signature": "2MMvMmzJ1WW3UJkmesy5/g=="
      }
    },
    "body" : {
      "content": {
        "timestamp": "2020-05-16T14:33:44.328Z",
        "item": {
          "buyerProtection": "ItemIneligible",
          "description": "This is the fourth book in the Harry Potter series. In excellent condition!"
        }
      }
    }
  }
}
```
##Template Definition

The JSON schema template ..

####Property Names 

Property names are pipe delimited ...

| Part | Description |
| ----------- | ----------- |
| 1 | XML attrbute name including the namespace (if any) |
| 2 | translated JSON property name|

Where the XML attribute name is suffixed with an asterisk, then it identifys that this a a reurring field - and will result in a array of values. This notation will work at the object level and the propery level.

####Static Properties

To inject a static value into a resolved object - prefix the property name is an exclamation point (!).

```
      "GetItemResponse|content": {
        "!_kind": "GetItemResponse", // EXAMPLE HERE
        "Timestamp|timestamp": "datetime",
        "Ack|acknowledge": "string",
        "CorrelationID|correlationId": "integer",
        "Item|item": {
          "BuyerProtection|buyerProtection": "string",
          "Description|description": "string"
        }
      }
```
This will return an object that contains the literal value of the property ...

```json5
{
    "content": {
      "_kind": "GetItemResponse", // 
      "timestamp": "2020-05-16T14:33:44.328Z",
      "acknowledge": "Success",
      "correlationId": 755553470,
      "item": {
        "buyerProtection": "ItemIneligible",
        "description": "This is the fourth book in the Harry Potter series. In excellent condition!"
      }
    }
}
```


####Property Values 

A property value is either an object that describes an embedded value, or it's a terminal value datatype ...

| Name | Description |
| ----------- | ----------- |
| integer | Translates the XML value to an integer |
| float | Translates the XML value to a float |
| string | Translates the XML value to a string |
| text | Translates the XML value to a string |
| datetime | Translates the XML value formatted as an ISO8601 date into a Date value |

##Usage

```js
const schema = {
  "soapenv:Envelope|envelope": {
    "soapenv:Header|header" : {
      "ebl:RequesterCredentials|credentials": {
        "ebl:NotificationSignature|signature": "string"
      }
    },
    "soapenv:Body|body" : {
      "GetItemResponse|content": {
        "Timestamp|timestamp": "datetime",
        "Item|item": {
          "BuyerProtection|buyerProtection": "string",
          "Description|description": "string"
        }
      }
    }
  }
}

const xml = fs.readFileSync('./sample.xml','utf-8')

// Compile the schema into -- if calling multiple times, then cache this value 
const rdr = createReader(schema)

// Translate document
const json = rdr(xml)

```
