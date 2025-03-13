## Benchmark Report
> - CPU: Apple M2 Pro
> - RAM: 32 GB
> - NodeJS Version: v21.7.1
> - Backend Server: 1 core / 1 thread
> - Arguments: 
>   - Count: 10,000
>   - Threads: 4
>   - Simultaneous: 128
> - Total Elapsed Time: 459,258 ms

### Total
Type | Count | Success | Mean. | Stdev. | Minimum | Maximum
----|----|----|----|----|----|----
Total | 24,533 | 24,006 | 1,268.78 | 2,053.87 | 3 | 41,688

### Endpoints
Type | Count | Success | Mean. | Stdev. | Minimum | Maximum
----|----|----|----|----|----|----
POST /studio/customers/repositories/:accountCode/:repositoryCode/releases | 79 | 72 | 18,307.45 | 9,959.11 | 796 | 35,377
PATCH /hub/customers/sales/recommendations | 6 | 6 | 18,126.66 | 15,021.33 | 2,577 | 33,994
PATCH /hub/customers/orders/:id/discountable | 38 | 36 | 14,785.13 | 14,271.97 | 610 | 41,688
PATCH /hub/customers/carts/:cartId/commodities/discountable | 32 | 32 | 13,714.93 | 14,224.09 | 543 | 40,913
PATCH /hub/customers/orders/:orderId/goods/:goodId/snapshots | 3 | 3 | 12,550 | 6,229.82 | 4,524 | 19,710
GET /hub/customers/sales/collections/:id | 1 | 1 | 11,731 | 0 | 11,731 | 11,731
POST /studio/customers/repositories/:accountCode/:repositoryCode/commits/:commitId/workflows/:id/execute | 68 | 68 | 11,723.91 | 3,294.44 | 5,342 | 19,868
POST /studio/customers/repositories/:accountCode/:repositoryCode/commits/:commitId/workflows/:id/proceed | 2 | 2 | 11,617 | 162 | 11,455 | 11,779
POST /studio/customers/repositories/:accountCode/:repositoryCode/commits/:commitId/workflows/:id/compile | 8 | 5 | 8,925.75 | 8,016.19 | 1,284 | 22,429
POST /hub/admins/sales/collections | 13 | 13 | 7,555.92 | 5,309.06 | 470 | 14,454
DELETE /hub/admins/systematic/channels/:channelCode/categories/merge | 1 | 1 | 7,479 | 0 | 7,479 | 7,479
POST /studio/customers/repositories/:accountCode/:repositoryCode/releases/:releaseId/nodes/:id/execute | 48 | 48 | 7,026.93 | 2,044.43 | 3,111 | 13,922
GET /hub/admins/sales/collections/:id | 6 | 3 | 6,800 | 5,999.48 | 695 | 13,943
PATCH /hub/sellers/sales | 2 | 2 | 6,615.5 | 1,149.5 | 5,466 | 7,765
PATCH /hub/admins/coupons | 19 | 19 | 6,391.52 | 5,076.04 | 648 | 18,814
PATCH /hub/customers/orders | 8 | 8 | 4,909.37 | 779.59 | 3,860 | 5,968
POST /studio/customers/repositories/:accountCode/:repositoryCode/commits/:id/fork | 2 | 2 | 4,801 | 352 | 4,449 | 5,153
PATCH /hub/customers/orders/:id/discount | 2 | 2 | 4,175.5 | 642.5 | 3,533 | 4,818
POST /studio/customers/repositories/:accountCode/:repositoryCode/commits/workflows/standalone/accumulate | 1 | 1 | 4,082 | 0 | 4,082 | 4,082
POST /studio/chat/:accountCode/:repositoryCode/build/new-session | 65 | 65 | 4,064.41 | 1,868.78 | 1,029 | 7,432
POST /studio/chat/:accountCode/:repositoryCode/commits/:commitId/chatbot/:workflowId/autofill/:statementId | 2 | 2 | 3,936 | 331 | 3,605 | 4,267
PATCH /hub/customers/carts/:cartId/commodities | 47 | 47 | 3,921.76 | 2,386.79 | 165 | 8,867
PATCH /hub/sellers/orders/:orderId/goods | 12 | 12 | 3,814.58 | 701.48 | 2,532 | 5,032
POST /hub/customers/authenticate/sso/sync | 2 | 2 | 3,703 | 160 | 3,543 | 3,863
PUT /hub/customers/authenticate/sso | 2 | 2 | 3,528 | 94 | 3,434 | 3,622
POST /hub/admins/deposits/donations | 6 | 6 | 3,516.16 | 3,913.77 | 1,387 | 12,244
POST /studio/customers/accounts/:accountCode/secrets/emplace | 2 | 2 | 3,443 | 599 | 2,844 | 4,042
PUT /hub/sellers/sales/:id | 46 | 46 | 3,427.5 | 475.38 | 2,173 | 4,436
POST /hub/customers/carts/:cartId/commodities | 447 | 438 | 3,371.41 | 1,515.72 | 228 | 6,212
POST /studio/chat/:accountCode/:repositoryCode/commits/:commitId/chatbot/:workflowId/new-session | 3 | 3 | 3,327.66 | 295.04 | 2,912 | 3,567
PATCH /hub/customers/sales | 35 | 35 | 3,255.6 | 3,222.87 | 273 | 10,555
PATCH /hub/customers/commons/blockwords/find/all | 1 | 1 | 3,094 | 0 | 3,094 | 3,094
POST /studio/chat/:accountCode/:repositoryCode/releases/:releaseId/nodes/:id | 1 | 1 | 3,060 | 0 | 3,060 | 3,060
POST /hub/customers/orders | 265 | 265 | 3,054.09 | 1,782.8 | 228 | 9,292
PUT /studio/customers/repositories/:accountCode/:repositoryCode/commits/workflows/standalone | 1 | 1 | 2,846 | 0 | 2,846 | 2,846
PUT /studio/customers/repositories/:accountCode/:repositoryCode/commits/:id | 8 | 8 | 2,756.37 | 299.81 | 2,122 | 3,217
POST /hub/admins/systematic/channels/:channelCode/categories | 33 | 33 | 2,644.48 | 414.85 | 1,812 | 3,508
POST /studio/customers/repositories/:accountCode/:repositoryCode/commits | 177 | 177 | 2,641.84 | 3,009.96 | 1,160 | 26,805
POST /hub/customers/orders/:orderId/goods/:goodId/issues/:issueId/fees/:id | 4 | 4 | 2,628.25 | 47.95 | 2,578 | 2,699
PUT /studio/customers/accounts/:accountCode/schedules/:id/pause | 3 | 3 | 2,621 | 323.87 | 2,194 | 2,978
POST /studio/customers/repositories/:accountCode/:repositoryCode/commits/workflows/standalone | 4 | 4 | 2,582 | 145.16 | 2,371 | 2,772
PATCH /hub/customers/orders/:orderId/goods/:goodId/snapshots/:id/swagger | 8 | 8 | 2,566.37 | 388.58 | 1,995 | 3,084
PATCH /hub/admins/sales | 15 | 15 | 2,497.13 | 469.9 | 1,724 | 3,195
GET /hub/sellers/sales/:id | 12 | 12 | 2,470.08 | 279.78 | 2,088 | 2,891
GET /hub/sellers/sales/:saleId/snapshots/:id | 4 | 4 | 2,394.5 | 317.77 | 2,016 | 2,839
PUT /studio/customers/accounts/:accountCode/schedules/:id/resume | 2 | 2 | 2,287.5 | 554.5 | 1,733 | 2,842
GET /hub/admins/sales/:id | 13 | 13 | 2,275.69 | 279.49 | 1,727 | 2,734
GET /hub/customers/orders/:id | 8 | 8 | 2,244.12 | 217.65 | 1,979 | 2,486
GET /hub/sellers/sales/:id/replica | 14 | 14 | 2,196.21 | 469.08 | 1,158 | 3,244
POST /hub/sellers/sales | 804 | 804 | 2,188.43 | 1,021.1 | 115 | 4,846
GET /hub/customers/orders/:orderId/goods/:id | 15 | 15 | 2,120.26 | 433.59 | 1,198 | 2,863
PATCH /hub/admins/systematic/channels/:channelCode/categories | 3 | 3 | 2,070.66 | 196.22 | 1,800 | 2,259
POST /studio/chat/:accountCode/:repositoryCode/send-message | 66 | 66 | 2,060.21 | 848.59 | 734 | 3,949
PUT /hub/customers/authenticate/activate | 10 | 10 | 2,046.1 | 2,927.93 | 595 | 10,811
GET /hub/sellers/orders/:id | 6 | 5 | 1,974.5 | 473.84 | 1,001 | 2,445
POST /hub/customers/authenticate/join | 2,253 | 2,247 | 1,875.34 | 1,038.39 | 75 | 14,824
POST /hub/customers/authenticate/keys | 12 | 12 | 1,839.25 | 283.31 | 1,344 | 2,436
POST /studio/customers/accounts/:accountCode/widgets/:widgetCode/tiles | 14 | 0 | 1,808.85 | 274.96 | 1,346 | 2,262
POST /studio/customers/repositories/:accountCode/:repositoryCode/commits/:commitId/workflows/:id/simulate | 2 | 2 | 1,789 | 499 | 1,290 | 2,288
PATCH /studio/customers/repositories/:accountCode/:repositoryCode/commits/:commitId/workflows/:workflowId/histories/details | 4 | 4 | 1,786.5 | 237.47 | 1,462 | 2,129
PUT /hub/customers/authenticate/password/change | 14 | 14 | 1,655.85 | 435.33 | 963 | 2,850
POST /studio/customers/repositories/:accountCode/:repositoryCode/commits/:id/archive | 155 | 155 | 1,642.6 | 364.95 | 472 | 2,882
GET /hub/admins/orders/:id | 2 | 1 | 1,639 | 705 | 934 | 2,344
PUT /studio/customers/accounts/:accountCode/secrets/:id | 2 | 2 | 1,633 | 70 | 1,563 | 1,703
PUT /studio/customers/accounts/:accountCode/secrets/:secretId/values/:id | 1 | 1 | 1,626 | 0 | 1,626 | 1,626
PATCH /studio/customers/repositories/:accountCode/:repositoryCode/releases/:releaseId/nodes/:nodeId/histories | 26 | 26 | 1,614.07 | 380.31 | 852 | 2,343
GET /studio/customers/repositories/:accountCode/:repositoryCode/releases/:releaseId/nodes/:nodeId/histories/:id | 6 | 6 | 1,573.5 | 206.1 | 1,182 | 1,793
PATCH /studio/customers/repositories/:accountCode/:repositoryCode/commits/workflows/standalone/get | 1 | 1 | 1,554 | 0 | 1,554 | 1,554
GET /studio/chat/:accountCode/:repositoryCode/get-session | 8 | 8 | 1,549.12 | 358.6 | 1,032 | 2,112
PATCH /hub/customers/authenticate/sso | 4 | 4 | 1,532.25 | 602.39 | 766 | 2,123
PATCH /studio/customers/accounts/:accountCode/secrets/values | 26 | 26 | 1,502.96 | 1,763.88 | 589 | 10,201
PUT /hub/admins/systematic/channels/:channelCode/categories/:id | 2 | 2 | 1,482.5 | 532.5 | 950 | 2,015
PATCH /studio/customers/enterprises/:accountCode/teams | 6 | 6 | 1,423.33 | 122.69 | 1,265 | 1,595
PATCH /hub/admins/authenticate/login | 262 | 250 | 1,406.9 | 1,742.19 | 237 | 14,278
PATCH /studio/customers/repositories/:accountCode/:repositoryCode/commits/:commitId/buckets | 45 | 45 | 1,399.8 | 281.73 | 792 | 2,071
POST /hub/admins/sales/:saleId/audits/:id/approve | 759 | 759 | 1,392.33 | 604.24 | 14 | 3,460
POST /hub/sellers/orders/:orderId/goods/:goodId/issues/:issueId/fees | 5 | 5 | 1,364.4 | 243.07 | 967 | 1,690
POST /studio/customers/accounts/:accountCode/schedules | 30 | 30 | 1,359.2 | 276.53 | 850 | 2,019
POST /hub/sellers/coupons | 112 | 48 | 1,352.04 | 1,331.51 | 83 | 4,903
POST /hub/admins/sales/:saleId/audits/:id/reject | 8 | 8 | 1,336.5 | 229.85 | 868 | 1,585
PATCH /hub/sellers/systematic/channels/hierarchical | 836 | 836 | 1,318.68 | 725.76 | 7 | 9,608
DELETE /hub/customers/sales/:saleId/reviews/:id | 1 | 1 | 1,312 | 0 | 1,312 | 1,312
PUT /hub/sellers/sales/:saleId/questions/:inquiryId/comments/:id | 3 | 3 | 1,301.66 | 99.33 | 1,226 | 1,442
PUT /hub/admins/push-messages/:id | 3 | 3 | 1,300 | 488.01 | 675 | 1,866
PATCH /hub/sellers/sales/:saleId/audits/:auditId/comments | 3 | 3 | 1,295 | 165.3 | 1,062 | 1,428
POST /studio/customers/accounts/:accountCode/secrets/:secretId/values | 6 | 6 | 1,293.66 | 183.15 | 1,053 | 1,543
PUT /hub/customers/sales/:saleId/questions/:id | 3 | 3 | 1,279 | 151.27 | 1,073 | 1,432
DELETE /studio/customers/accounts/:accountCode/secrets/:secretId/values/:id | 4 | 4 | 1,277.75 | 127.72 | 1,141 | 1,487
POST /hub/admins/coupons | 177 | 177 | 1,270.61 | 718.02 | 75 | 3,286
GET /studio/customers/repositories/:accountCode/:repositoryCode/commits/workflows/standalone/:workflowId | 2 | 2 | 1,258.5 | 37.5 | 1,221 | 1,296
PATCH /studio/customers/repositories/:accountCode/:repositoryCode/commits/:commitId/workflows/:workflowId/histories | 32 | 32 | 1,257.93 | 457.44 | 465 | 2,484
POST /studio/customers/accounts | 398 | 394 | 1,248.8 | 1,551.89 | 165 | 13,653
PUT /hub/sellers/orders/:orderId/goods/:goodId/issues/:issueId/comments/:id | 9 | 9 | 1,239.33 | 242.16 | 892 | 1,647
GET /studio/customers/accounts/:accountCode/schedules/:id | 1 | 1 | 1,231 | 0 | 1,231 | 1,231
PUT /hub/customers/orders/:orderId/goods/:goodId/issues/:issueId/comments/:id | 9 | 9 | 1,229.55 | 230.35 | 788 | 1,549
PATCH /studio/customers/repositories/:accountCode/:repositoryCode/commits | 20 | 20 | 1,223.05 | 216.74 | 1,001 | 1,900
POST /hub/customers/authenticate/external | 4 | 4 | 1,215.25 | 323.89 | 908 | 1,740
PATCH /studio/customers/accounts/:accountCode/schedules | 30 | 30 | 1,205.66 | 252.59 | 638 | 1,775
PUT /hub/admins/sales/:saleId/audits/:auditId/comments/:id | 6 | 6 | 1,202.66 | 130.26 | 1,036 | 1,457
PATCH /hub/sellers/sales/:saleId/snapshots/:snapshotId/units/:unitId/parameters | 10 | 10 | 1,202.5 | 284.52 | 790 | 1,885
GET /studio/customers/repositories/:accountCode/:repositoryCode/commits/:commitId/buckets/:id | 9 | 9 | 1,189.11 | 226.51 | 856 | 1,544
DELETE /hub/customers/sales/:saleId/questions/:id | 2 | 2 | 1,165 | 60 | 1,105 | 1,225
PATCH /hub/customers/coupons | 4 | 4 | 1,158.5 | 519.54 | 665 | 2,027
PUT /studio/customers/repositories/:accountCode/:repositoryCode/accesses/:id | 18 | 14 | 1,155.22 | 707.58 | 318 | 2,579
POST /studio/customers/repositories/:accountCode | 248 | 247 | 1,151.39 | 358.44 | 188 | 2,312
PATCH /hub/customers/orders/:orderId/goods/:goodId/issues/:issueId/comments | 25 | 25 | 1,149.11 | 275.75 | 587 | 1,696
PATCH /hub/customers/orders/:orderId/goods/:goodId/issues | 16 | 16 | 1,143.31 | 340.7 | 450 | 1,683
DELETE /studio/customers/enterprises/:accountCode/teams/:id | 4 | 2 | 1,142.5 | 150.84 | 915 | 1,296
POST /studio/chat/:accountCode/:repositoryCode/get-presigned-url | 1 | 1 | 1,133 | 0 | 1,133 | 1,133
PUT /hub/customers/sales/:saleId/reviews/:id | 6 | 6 | 1,130.83 | 265.19 | 903 | 1,687
DELETE /studio/customers/repositories/:accountCode/:repositoryCode/accesses/:id | 24 | 12 | 1,129.25 | 445.73 | 157 | 1,840
PATCH /hub/customers/push-messages/histories | 52 | 52 | 1,128.82 | 587.13 | 407 | 3,251
PATCH /studio/admins/repositories/:accountCode/:repositoryCode/commits/:commitId/workflows/:workflowId/histories | 5 | 5 | 1,127.2 | 323.11 | 718 | 1,683
PATCH /studio/customers/accounts/:accountCode/secrets | 61 | 61 | 1,123.01 | 253.54 | 654 | 1,779
POST /hub/admins/sales/:saleId/audits | 772 | 772 | 1,118.96 | 490.11 | 143 | 2,434
GET /studio/customers/enterprises/:accountCode/teams/:id | 6 | 4 | 1,105.16 | 240.74 | 667 | 1,476
GET /hub/sellers/orders/:orderId/goods/:id | 32 | 8 | 1,104.78 | 717.83 | 324 | 2,565
POST /hub/sellers/authenticate/login | 27 | 22 | 1,104.59 | 281.99 | 373 | 1,476
PUT /hub/sellers/sales/:saleId/reviews/:inquiryId/comments/:id | 9 | 9 | 1,100.55 | 96.92 | 922 | 1,301
POST /hub/admins/sales/:saleId/audits/:auditId/comments | 5 | 5 | 1,094.59 | 204.08 | 795 | 1,412
DELETE /hub/admins/systematic/sections/merge | 19 | 19 | 1,090.63 | 533.74 | 281 | 1,989
POST /studio/customers/enterprises | 155 | 155 | 1,080.4 | 1,170.94 | 108 | 11,753
PUT /hub/sellers/sales/:saleId/audits/:auditId/comments/:id | 6 | 6 | 1,070.5 | 214.19 | 773 | 1,451
DELETE /hub/customers/authenticate/keys/:id | 2 | 2 | 1,050 | 110 | 940 | 1,160
DELETE /hub/admins/coupons/:id | 2 | 2 | 1,049 | 48 | 1,001 | 1,097
GET /studio/customers/shelves/releases/workflows/:id | 4 | 4 | 1,047.5 | 283.67 | 575 | 1,314
PATCH /studio/customers/shelves/commits/workflows | 150 | 150 | 1,041.5 | 516.75 | 162 | 2,336
GET /studio/customers/enterprises/:accountCode/teams/:code/get | 4 | 4 | 1,034.75 | 448.62 | 481 | 1,659
GET /hub/customers/push-messages/histories/:id | 10 | 10 | 1,032.59 | 250.78 | 785 | 1,611
GET /hub/customers/orders/:orderId/goods/:goodId/issues/:issueId/comments/:id | 6 | 6 | 1,026.16 | 203.8 | 853 | 1,394
DELETE /studio/customers/enterprises/:id | 2 | 2 | 1,026 | 247 | 779 | 1,273
GET /studio/customers/enterprises/:id | 5 | 3 | 1,023.8 | 294.74 | 603 | 1,526
GET /studio/customers/repositories/:accountCode/:repositoryCode/releases/:id | 1 | 1 | 1,019 | 0 | 1,019 | 1,019
GET /hub/admins/systematic/channels/:id | 4 | 4 | 1,014.25 | 414.88 | 594 | 1,692
POST /hub/customers/coupons/tickets | 13 | 10 | 1,012 | 377.57 | 411 | 1,640
POST /studio/customers/accounts/:accountCode/secrets | 197 | 197 | 1,008.44 | 611.42 | 369 | 8,578
GET /studio/customers/repositories/:accountCode/:id | 14 | 11 | 1,001.92 | 193.15 | 706 | 1,505
POST /hub/sellers/sales/:saleId/reviews/:inquiryId/comments | 26 | 26 | 997.15 | 219.62 | 589 | 1,393
PUT /hub/customers/sales/:saleId/reviews/:inquiryId/comments/:id | 9 | 9 | 994.22 | 192.47 | 727 | 1,383
PUT /studio/customers/repositories/:accountCode/:id | 4 | 4 | 992.5 | 138.7 | 819 | 1,207
GET /studio/customers/accounts/:accountCode/secrets/:key/get | 2 | 2 | 992 | 13 | 979 | 1,005
POST /hub/sellers/sales/:saleId/snapshots/:snapshotId/units/:unitId/parameters | 19 | 19 | 990 | 181.39 | 795 | 1,316
PATCH /hub/admins/sales/:saleId/snapshots/audits | 21 | 21 | 983.71 | 183.72 | 593 | 1,421
PATCH /studio/customers/repositories/:accountCode/:repositoryCode/releases | 43 | 43 | 982.48 | 287.34 | 346 | 1,560
PUT /hub/customers/orders/:orderId/goods/:id/close | 12 | 9 | 979.16 | 389.27 | 574 | 1,707
GET /studio/customers/repositories/:accountCode/:repositoryCode/commits/:id | 2 | 2 | 971.5 | 56.5 | 915 | 1,028
PUT /hub/customers/orders/:orderId/goods/:id/open | 13 | 9 | 966.53 | 182.33 | 576 | 1,195
POST /studio/customers/enterprises/:accountCode/teams | 88 | 84 | 958.47 | 392.96 | 191 | 2,191
GET /studio/customers/repositories/:accountCode/:repositoryCode/commits/:commitId/workflows/:workflowId/histories/:id | 14 | 14 | 954.71 | 347.61 | 509 | 1,712
DELETE /hub/sellers/sales/:id/pause | 3 | 3 | 953.33 | 154.19 | 755 | 1,131
DELETE /hub/sellers/sales/:id/suspend | 2 | 2 | 945 | 29 | 916 | 974
POST /hub/sellers/sales/:saleId/questions/:questionId | 33 | 33 | 942.51 | 308.8 | 335 | 1,786
POST /hub/sellers/orders/:orderId/goods/:goodId/issues/:issueId/comments | 62 | 62 | 942 | 253.08 | 422 | 1,436
GET /studio/customers/accounts/:accountCode/secrets/:id | 13 | 11 | 938.76 | 225.48 | 459 | 1,421
POST /hub/sellers/orders/:orderId/goods/:goodId/issues | 71 | 71 | 933.59 | 281.31 | 323 | 1,597
GET /hub/customers/sales/:saleId/questions/:inquiryId/comments/:id | 2 | 2 | 920 | 28 | 892 | 948
POST /hub/customers/orders/:orderId/goods/:goodId/issues | 119 | 119 | 918.91 | 266.68 | 242 | 1,753
PATCH /studio/admins/enterprises | 17 | 17 | 914.7 | 278.24 | 363 | 1,364
DELETE /hub/admins/sales/collections/:id | 3 | 3 | 910.33 | 61.27 | 824 | 960
POST /hub/customers/orders/:orderId/goods/:goodId/issues/:issueId/comments | 68 | 68 | 896.42 | 322.32 | 240 | 1,753
GET /hub/sellers/sales/:saleId/audits/:auditId/comments/:id | 4 | 4 | 893.5 | 214.56 | 552 | 1,137
POST /admin/access/elite | 11 | 11 | 893.09 | 304.7 | 513 | 1,465
POST /hub/customers/sales/:saleId/reviews/:inquiryId/comments | 32 | 32 | 885.84 | 201.75 | 436 | 1,251
POST /hub/sellers/sales/:saleId/audits/:auditId/comments | 5 | 5 | 883 | 109.29 | 726 | 1,007
POST /hub/customers/sales/:saleId/questions/:inquiryId/comments | 27 | 27 | 879.29 | 190.67 | 282 | 1,197
POST /hub/customers/orders/:id/publish | 207 | 207 | 876.31 | 427.41 | 84 | 1,965
POST /hub/customers/authenticate | 5,960 | 5,960 | 872.17 | 919.8 | 3 | 11,492
GET /hub/customers/sales/:saleId/reviews/:inquiryId/comments/:id | 6 | 6 | 867.16 | 129.81 | 681 | 1,012
PATCH /hub/admins/systematic/channels | 9 | 9 | 864.88 | 179.53 | 592 | 1,207
PATCH /studio/customers/repositories/:accountCode | 36 | 36 | 852.55 | 394.66 | 263 | 1,949
PUT /hub/sellers/sales/:saleId/snapshots/:id/version/description | 4 | 4 | 852.5 | 176.19 | 739 | 1,157
POST /hub/sellers/sales/:saleId/questions/:inquiryId/comments | 29 | 29 | 843.62 | 211.85 | 412 | 1,380
GET /hub/customers/orders/:orderId/goods/:goodId/issues/:id | 4 | 4 | 842.75 | 140.04 | 660 | 1,054
PUT /hub/customers/sales/:saleId/questions/:inquiryId/comments/:id | 3 | 3 | 842 | 112.9 | 743 | 1,000
PATCH /studio/customers/accounts | 18 | 18 | 838.5 | 352.32 | 210 | 1,805
POST /hub/customers/sales/:saleId/questions | 89 | 89 | 838.07 | 309.63 | 274 | 1,616
PATCH /hub/admins/systematic/sections | 2 | 2 | 835 | 292 | 543 | 1,127
GET /hub/sellers/sales/:saleId/audits/:id | 8 | 8 | 833 | 246.29 | 503 | 1,211
GET /hub/customers/sales/:saleId/reviews/:id | 4 | 3 | 832 | 230.13 | 595 | 1,146
GET /studio/chat/:accountCode/:repositoryCode/get-message | 22 | 22 | 829.86 | 239.13 | 344 | 1,385
PATCH /hub/customers/sales/:saleId/questions/:inquiryId/comments | 5 | 5 | 825.8 | 151.83 | 610 | 1,083
DELETE /hub/customers/orders/:id | 2 | 1 | 823.5 | 62.5 | 761 | 886
PATCH /studio/customers/enterprises/:accountCode/employees | 57 | 57 | 821.73 | 387.76 | 229 | 1,775
PATCH /hub/sellers/orders/:orderId/goods/:goodId/issues/:issueId/fees | 1 | 1 | 815 | 0 | 815 | 815
PATCH /hub/customers/sales/:saleId/reviews/:inquiryId/comments | 4 | 4 | 810 | 294.71 | 610 | 1,318
PUT /hub/customers/orders/:id/publish/open | 4 | 4 | 797.75 | 276.84 | 421 | 1,203
PATCH /hub/customers/authenticate/keys | 1 | 1 | 782 | 0 | 782 | 782
PUT /hub/admins/systematic/channels/:id | 2 | 2 | 781.5 | 12.5 | 769 | 794
DELETE /studio/customers/enterprises/:accountCode/teams/:teamCode/companions/:id | 72 | 42 | 776.23 | 452.94 | 88 | 1,792
GET /hub/admins/push-messages/:id | 6 | 6 | 770.16 | 273.75 | 417 | 1,294
GET /studio/customers/repositories/:accountCode/:repositoryCode/accesses/:id | 21 | 21 | 760.52 | 272.7 | 100 | 1,249
POST /hub/admins/systematic/channels | 90 | 90 | 758.68 | 225.18 | 247 | 1,738
POST /admin/access/villain | 16 | 16 | 755.87 | 295.19 | 314 | 1,426
POST /hub/customers/sales/:saleId/reviews | 69 | 69 | 755.53 | 414.91 | 158 | 2,267
GET /studio/customers/enterprises/:accountCode/employees/:id | 68 | 66 | 751.82 | 306.44 | 99 | 1,426
PATCH /hub/admins/push-messages | 2 | 2 | 741 | 138 | 603 | 879
POST /hub/admins/push-messages | 31 | 31 | 732 | 204.33 | 388 | 1,097
DELETE /studio/customers/accounts/:accountCode/secrets/:id | 2 | 2 | 718 | 167 | 551 | 885
GET /studio/customers/repositories/:accountCode/:code/get | 11 | 7 | 717.72 | 261.49 | 282 | 1,123
GET /hub/customers/sales/:saleId/questions/:id | 12 | 7 | 712.66 | 286.7 | 381 | 1,384
DELETE /hub/admins/push-messages/:id | 8 | 8 | 712.37 | 150.23 | 570 | 1,092
GET /hub/customers/sales/:id | 277 | 268 | 707.33 | 419.91 | 118 | 3,017
GET /hub/sellers/orders/:orderId/goods/:goodId/issues/:id | 4 | 4 | 684 | 131.69 | 471 | 824
GET /studio/customers/accounts/:code/get | 3 | 0 | 683 | 101.4 | 563 | 811
POST /studio/customers/repositories/:accountCode/:repositoryCode/accesses | 184 | 124 | 672.79 | 406.46 | 10 | 1,767
PATCH /hub/customers/sales/:saleId/questions | 39 | 39 | 670.38 | 220.63 | 251 | 1,066
GET /studio/customers/enterprises/:accountCode/get | 5 | 3 | 658.6 | 159.48 | 415 | 802
PUT /studio/customers/repositories/:accountCode/:repositoryCode/accesses/:id/approve | 124 | 124 | 648.91 | 305.62 | 110 | 1,495
POST /hub/admins/systematic/sections | 34 | 34 | 647.2 | 213.62 | 161 | 1,048
PATCH /hub/customers/orders/:orderId/goods/:goodId/issues/:issueId/fees | 1 | 1 | 626 | 0 | 626 | 626
GET /hub/customers/coupons/tickets/:id | 2 | 2 | 602 | 165 | 437 | 767
GET /studio/customers/accounts/:id | 3 | 0 | 594.66 | 138.92 | 400 | 715
GET /hub/admins/systematic/sections/:id | 3 | 3 | 584.66 | 119.03 | 500 | 753
GET /hub/customers/coupons/:id | 2 | 0 | 577.5 | 180.5 | 397 | 758
GET /hub/admins/coupons/:id | 3 | 3 | 577.33 | 149.35 | 402 | 767
POST /hub/sellers/authenticate/join | 591 | 590 | 555.44 | 283.72 | 85 | 1,573
PATCH /hub/customers/authenticate/login | 3,323 | 3,320 | 552.37 | 429.18 | 70 | 2,364
GET /studio/customers/enterprises/:accountCode/teams/:teamCode/companions/:id | 216 | 174 | 543.84 | 529.91 | 5 | 2,391
GET /hub/customers/authenticate/keys/:id | 2 | 2 | 537 | 189 | 348 | 726
POST /studio/customers/enterprises/:accountCode/teams/:teamCode/companions | 555 | 535 | 535.96 | 478.19 | 7 | 2,215
POST /hub/sellers/sales/:saleId/reviews/:reviewId | 26 | 26 | 533.46 | 332.9 | 91 | 1,597
DELETE /hub/admins/coupons/:id/destroy | 219 | 219 | 527.86 | 282.45 | 5 | 1,376
PUT /hub/admins/systematic/sections/:id | 2 | 2 | 524.5 | 195.5 | 329 | 720
PUT /studio/customers/enterprises/:accountCode/employees/approve | 597 | 597 | 509.44 | 414.46 | 11 | 2,386
POST /studio/customers/enterprises/:accountCode/employees | 660 | 620 | 499.98 | 421.95 | 6 | 2,288
GET /hub/customers/authenticate | 5 | 5 | 489.4 | 184.59 | 313 | 825
PATCH /studio/customers/repositories/:accountCode/:repositoryCode/accesses | 25 | 25 | 456.52 | 159.39 | 196 | 888
PATCH /admin/aggregate | 10 | 10 | 447.2 | 170.7 | 165 | 759
PATCH /studio/customers/enterprises/:accountCode/teams/:teamCode/companions | 35 | 35 | 440.48 | 212.18 | 165 | 932
DELETE /studio/customers/accounts/:id | 1 | 1 | 438 | 0 | 438 | 438
PATCH /hub/customers/commons/check/privacy | 2 | 2 | 431 | 43 | 388 | 474
GET /studio/customers/repositories/:accountCode/:repositoryCode/releases/:version/get | 1 | 1 | 430 | 0 | 430 | 430
PATCH /hub/customers/authenticate/refresh | 2 | 2 | 414 | 153 | 261 | 567
PUT /studio/customers/enterprises/:accountCode/teams/:teamCode/companions/:id | 240 | 138 | 282.58 | 368.01 | 9 | 2,109
GET /_health | 1 | 1 | 235 | 0 | 235 | 235
PATCH /hub/customers/sales/:saleId/reviews | 2 | 2 | 132.5 | 48.5 | 84 | 181
PATCH /hub/customers/sales/collections | 3 | 3 | 106.66 | 85.04 | 6 | 214

### Failures
Method | Path | Count | Success
-------|------|-------|--------
PATCH | /hub/customers/authenticate/login | 3,323 | 3,320
POST | /hub/customers/authenticate/join | 2,253 | 2,247
POST | /studio/customers/enterprises/:accountCode/employees | 660 | 620
POST | /hub/sellers/authenticate/join | 591 | 590
POST | /studio/customers/enterprises/:accountCode/teams/:teamCode/companions | 555 | 535
POST | /hub/customers/carts/:cartId/commodities | 447 | 438
POST | /studio/customers/accounts | 398 | 394
GET | /hub/customers/sales/:id | 277 | 268
PATCH | /hub/admins/authenticate/login | 262 | 250
POST | /studio/customers/repositories/:accountCode | 248 | 247
PUT | /studio/customers/enterprises/:accountCode/teams/:teamCode/companions/:id | 240 | 138
GET | /studio/customers/enterprises/:accountCode/teams/:teamCode/companions/:id | 216 | 174
POST | /studio/customers/repositories/:accountCode/:repositoryCode/accesses | 184 | 124
POST | /hub/sellers/coupons | 112 | 48
POST | /studio/customers/enterprises/:accountCode/teams | 88 | 84
POST | /studio/customers/repositories/:accountCode/:repositoryCode/releases | 79 | 72
DELETE | /studio/customers/enterprises/:accountCode/teams/:teamCode/companions/:id | 72 | 42
GET | /studio/customers/enterprises/:accountCode/employees/:id | 68 | 66
PATCH | /hub/customers/orders/:id/discountable | 38 | 36
GET | /hub/sellers/orders/:orderId/goods/:id | 32 | 8
POST | /hub/sellers/authenticate/login | 27 | 22
DELETE | /studio/customers/repositories/:accountCode/:repositoryCode/accesses/:id | 24 | 12
PUT | /studio/customers/repositories/:accountCode/:repositoryCode/accesses/:id | 18 | 14
GET | /studio/customers/repositories/:accountCode/:id | 14 | 11
POST | /studio/customers/accounts/:accountCode/widgets/:widgetCode/tiles | 14 | 0
PUT | /hub/customers/orders/:orderId/goods/:id/open | 13 | 9
POST | /hub/customers/coupons/tickets | 13 | 10
GET | /studio/customers/accounts/:accountCode/secrets/:id | 13 | 11
PUT | /hub/customers/orders/:orderId/goods/:id/close | 12 | 9
GET | /hub/customers/sales/:saleId/questions/:id | 12 | 7
GET | /studio/customers/repositories/:accountCode/:code/get | 11 | 7
POST | /studio/customers/repositories/:accountCode/:repositoryCode/commits/:commitId/workflows/:id/compile | 8 | 5
GET | /studio/customers/enterprises/:accountCode/teams/:id | 6 | 4
GET | /hub/sellers/orders/:id | 6 | 5
GET | /hub/admins/sales/collections/:id | 6 | 3
GET | /studio/customers/enterprises/:id | 5 | 3
GET | /studio/customers/enterprises/:accountCode/get | 5 | 3
DELETE | /studio/customers/enterprises/:accountCode/teams/:id | 4 | 2
GET | /hub/customers/sales/:saleId/reviews/:id | 4 | 3
GET | /studio/customers/accounts/:code/get | 3 | 0
GET | /studio/customers/accounts/:id | 3 | 0
GET | /hub/customers/coupons/:id | 2 | 0
GET | /hub/admins/orders/:id | 2 | 1
DELETE | /hub/customers/orders/:id | 2 | 1