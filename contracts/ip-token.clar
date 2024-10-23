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
