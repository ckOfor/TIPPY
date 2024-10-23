;; IP Token Contract
(define-non-fungible-token ip-token uint)

(define-data-var last-token-id uint u0)
(define-map token-uris uint (string-ascii 256))
(define-map token-royalties uint uint)
(define-map token-metadata uint {
    creator: principal,
    title: (string-ascii 64),
    description: (string-ascii 256)
})

;; Mint new IP token
(define-public (mint (uri (string-ascii 256))
                    (title (string-ascii 64))
                    (description (string-ascii 256))
                    (royalty uint))
    (let ((token-id (+ (var-get last-token-id) u1)))
        (asserts! (<= royalty u100) (err u1))
        (try! (nft-mint? ip-token token-id tx-sender))
        (map-set token-uris token-id uri)
        (map-set token-royalties token-id royalty)
        (map-set token-metadata token-id {
            creator: tx-sender,
            title: title,
            description: description
        })
        (var-set last-token-id token-id)
        (ok token-id)))


