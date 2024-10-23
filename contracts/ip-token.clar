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

;; Transfer IP token
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
    (begin
        (asserts! (is-eq tx-sender sender) (err u2))
        (try! (nft-transfer? ip-token token-id sender recipient))
        (ok true)))

;; Get token metadata
(define-read-only (get-token-metadata (token-id uint))
    (ok (map-get? token-metadata token-id)))

;; Royalty Distribution Contract
(define-map royalty-balances principal uint)

;; Record and distribute revenue
(define-public (record-revenue (token-id uint) (amount uint))
    (let ((royalty (default-to u0 (map-get? token-royalties token-id)))
          (metadata (unwrap! (map-get? token-metadata token-id) (err u1)))
          (creator (get creator metadata))
          (royalty-amount (/ (* amount royalty) u100)))
        (try! (stx-transfer? royalty-amount tx-sender creator))
        (ok true)))

;; Governance Contract
(define-map proposals uint {
    proposer: principal,
    title: (string-ascii 64),
    voting-ends: uint,
    votes-for: uint,
    votes-against: uint
})
(define-data-var proposal-count uint u0)

;; Create new proposal
(define-public (create-proposal (title (string-ascii 64)) (voting-period uint))
    (let ((proposal-id (+ (var-get proposal-count) u1)))
        (map-set proposals proposal-id {
            proposer: tx-sender,
            title: title,
            voting-ends: (+ block-height voting-period),
            votes-for: u0,
            votes-against: u0
        })
        (var-set proposal-count proposal-id)
        (ok proposal-id)))

;; Vote on proposal
(define-public (vote (proposal-id uint) (support bool))
    (let ((proposal (unwrap! (map-get? proposals proposal-id) (err u1))))
        (asserts! (< block-height (get voting-ends proposal)) (err u2))
        (if support
            (map-set proposals proposal-id
                (merge proposal { votes-for: (+ (get votes-for proposal) u1) }))
            (map-set proposals proposal-id
                (merge proposal { votes-against: (+ (get votes-against proposal) u1) })))
        (ok true)))
