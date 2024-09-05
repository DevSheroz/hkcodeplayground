schema = [
    {
        "name": "EP_STAGING_SELL_IN_MONTHLY",
        "table": "EP_STAGING_SELL_IN_MONTHLY",
        "measures": [
            {
                "name": "count",
                "type": "count",
                "sql": "QTY"
            },
            {
                "name": "total_amount",
                "type": "sum",
                "sql": "AMT"
            },
            {
                "name": "average_amount",
                "type": "avg",
                "sql": "AMT"
            }
        ],
        "dimensions": [
            {
                "name": "YYYYMM",
                "type": "string",
                "sql": "YYYYMM",
                "description": "실적년월 (Performance Year-Month)"
            },
            {
                "name": "SOLD_TO",
                "type": "string",
                "sql": "SOLD_TO",
                "description": "판매처 (Sold To)"
            },
            {
                "name": "SHIP_TO",
                "type": "string",
                "sql": "SHIP_TO",
                "description": "도착지 (Ship To)"
            },
            {
                "name": "RECEIPT_COUNTRY",
                "type": "string",
                "sql": "RECEIPT_COUNTRY",
                "description": "도착지나라 (Receipt Country)"
            },
            {
                "name": "MATERIAL_CD",
                "type": "string",
                "sql": "MATERIAL_CD",
                "description": "자재코드 (Material Code)"
            },
            {
                "name": "MATERIAL_GROUP",
                "type": "string",
                "sql": "MATERIAL_GROUP",
                "description": "자재그룹 (Material Group)"
            },
            {
                "name": "MATERIAL_TYPE",
                "type": "string",
                "sql": "MATERIAL_TYPE",
                "description": "자재유형 (Material Type)"
            },
            {
                "name": "RHQ_CD",
                "type": "string",
                "sql": "RHQ_CD",
                "description": "지역본부코드 (Regional HQ Code)"
            },
            {
                "name": "SALES_GROUP_CD",
                "type": "string",
                "sql": "SALES_GROUP_CD",
                "description": "영업그룹코드 (Sales Group Code)"
            },
            {
                "name": "SALES_ORG_CD",
                "type": "string",
                "sql": "SALES_ORG_CD",
                "description": "판매조직 (Sales Organization Code)"
            },
            {
                "name": "SALES_OFFICE_CD",
                "type": "string",
                "sql": "SALES_OFFICE_CD",
                "description": "지법인코드 (Sales Office Code)"
            },
            {
                "name": "SALES_DIST_CD",
                "type": "string",
                "sql": "SALES_DIST_CD",
                "description": "지역세부코드 (Sales District Code)"
            },
            {
                "name": "DIST_CHANNEL1",
                "type": "string",
                "sql": "DIST_CHANNEL1",
                "description": "판매채널1 (Distribution Channel 1)"
            },
            {
                "name": "DIST_CHANNEL2",
                "type": "string",
                "sql": "DIST_CHANNEL2",
                "description": "판매채널2 (Distribution Channel 2)"
            },
            {
                "name": "DIST_CHANNEL",
                "type": "string",
                "sql": "DIST_CHANNEL",
                "description": "판매채널 (Distribution Channel)"
            },
            {
                "name": "BIZ_TYPE",
                "type": "string",
                "sql": "BIZ_TYPE",
                "description": "비즈니스유형 (Business Type)"
            },
            {
                "name": "RE_SEG",
                "type": "string",
                "sql": "RE_SEG",
                "description": "RE구분 (RE Segment)"
            },
            {
                "name": "PLANT",
                "type": "string",
                "sql": "PLANT",
                "description": "플랜트 (Plant)"
            },
            {
                "name": "MP_LINE1",
                "type": "string",
                "sql": "MP_LINE1",
                "description": "생산라인1 (Manufacturing Line 1)"
            },
            {
                "name": "MP_LINE2",
                "type": "string",
                "sql": "MP_LINE2",
                "description": "생산라인2 (Manufacturing Line 2)"
            },
            {
                "name": "ITEM_PRICE_GROUP",
                "type": "string",
                "sql": "ITEM_PRICE_GROUP",
                "description": "자재가격그룹 (Item Price Group)"
            },
            {
                "name": "PROD_GROUP",
                "type": "string",
                "sql": "PROD_GROUP",
                "description": "제품그룹 (Product Group)"
            },
            {
                "name": "PROD_HRCY_LV1",
                "type": "string",
                "sql": "PROD_HRCY_LV1",
                "description": "제품계층_1레벨 (Product Hierarchy Level 1)"
            },
            {
                "name": "BRAND",
                "type": "string",
                "sql": "BRAND",
                "description": "브랜드 (Brand)"
            },
            {
                "name": "DIVISON",
                "type": "string",
                "sql": "DIVISON",
                "description": "DIVISION"
            },
            {
                "name": "QTY",
                "type": "numeric",
                "sql": "QTY",
                "description": "수량 (Quantity)"
            },
            {
                "name": "UNIT_OF_QTY",
                "type": "string",
                "sql": "UNIT_OF_QTY",
                "description": "수량단위 (Unit of Quantity)"
            },
            {
                "name": "WGT",
                "type": "numeric",
                "sql": "WGT",
                "description": "중량 (Weight)"
            },
            {
                "name": "UNIT_OF_WGT",
                "type": "string",
                "sql": "UNIT_OF_WGT",
                "description": "중량단위 (Unit of Weight)"
            },
            {
                "name": "AMT",
                "type": "numeric",
                "sql": "AMT",
                "description": "금액 (Amount)"
            },
            {
                "name": "CURRENCY",
                "type": "string",
                "sql": "CURRENCY",
                "description": "통화 (Currency)"
            },
            {
                "name": "INV_QTY",
                "type": "numeric",
                "sql": "INV_QTY",
                "description": "INV수량 (Invoice Quantity)"
            },
            {
                "name": "AMT_USD",
                "type": "numeric",
                "sql": "AMT_USD",
                "description": "달러금액 (Amount in USD)"
            },
            {
                "name": "AMT_EUR",
                "type": "numeric",
                "sql": "AMT_EUR",
                "description": "유로금액 (Amount in EUR)"
            },
            {
                "name": "CREAT_BY",
                "type": "string",
                "sql": "CREAT_BY",
                "description": "작성자 (Created By)"
            },
            {
                "name": "AMT_KRW",
                "type": "numeric",
                "sql": "AMT_KRW",
                "description": "원화금액 (Amount in KRW)"
            },
            {
                "name": "DOC_CURRENCY",
                "type": "string",
                "sql": "DOC_CURRENCY",
                "description": "DOC_CURRENCY"
            },
            {
                "name": "DEDUCTION_RATE",
                "type": "float",
                "sql": "DEDUCTION_RATE",
                "description": "Deduction Rate"
            },
            {
                "name": "NET_AMT",
                "type": "numeric",
                "sql": "NET_AMT",
                "description": "Net Amount"
            },
            {
                "name": "NET_AMT_USD",
                "type": "numeric",
                "sql": "NET_AMT_USD",
                "description": "Net Amount in USD"
            },
            {
                "name": "NET_AMT_KRW",
                "type": "numeric",
                "sql": "NET_AMT_KRW",
                "description": "Net Amount in KRW"
            },
            {
                "name": "NET_AMT_EUR",
                "type": "numeric",
                "sql": "NET_AMT_EUR",
                "description": "Net Amount in EUR"
            },
            {
                "name": "SAP_CREAT_DT",
                "type": "datetime",
                "sql": "SAP_CREAT_DT",
                "description": "SAP데이터생성시각 (SAP Data Creation Time)"
            },
            {
                "name": "CREAT_DT",
                "type": "datetime",
                "sql": "CREAT_DT",
                "description": "Creation Date"
            }
        ]
    }
]
