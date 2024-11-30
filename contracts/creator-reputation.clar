;; Creator Reputation Contract

;; Constants
(define-constant contract-owner tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-CREATOR-NOT-FOUND (err u101))
(define-constant ERR-INVALID-SCORE (err u102))

;; Data Maps
(define-map creator-reputations
    { creator: principal }
    {
        score: uint,
        tokens-minted: uint,
        total-revenue: uint,
        successful-sales: uint
    }
)

;; Read-only functions
(define-read-only (get-creator-reputation (creator principal))
    (default-to
        { score: u0, tokens-minted: u0, total-revenue: u0, successful-sales: u0 }
        (map-get? creator-reputations { creator: creator })
    )
)

(define-read-only (get-contract-owner)
    contract-owner
)

;; Public functions
(define-public (initialize-creator (creator principal))
    (begin
        (asserts! (is-eq tx-sender contract-owner) ERR-NOT-AUTHORIZED)
        (ok (map-set creator-reputations
            { creator: creator }
            { score: u100, tokens-minted: u0, total-revenue: u0, successful-sales: u0 }
        ))
    )
)

(define-public (update-reputation-token-minted (creator principal))
    (let (
        (current-rep (get-creator-reputation creator))
    )
    (begin
        (asserts! (is-eq tx-sender contract-owner) ERR-NOT-AUTHORIZED)
        (ok (map-set creator-reputations
            { creator: creator }
            (merge current-rep {
                score: (+ (get score current-rep) u10),
                tokens-minted: (+ (get tokens-minted current-rep) u1)
            })
        ))
    ))
)

(define-public (update-reputation-sale (creator principal) (revenue uint))
    (let (
        (current-rep (get-creator-reputation creator))
    )
    (begin
        (asserts! (is-eq tx-sender contract-owner) ERR-NOT-AUTHORIZED)
        (ok (map-set creator-reputations
            { creator: creator }
            (merge current-rep {
                score: (+ (get score current-rep) u5),
                total-revenue: (+ (get total-revenue current-rep) revenue),
                successful-sales: (+ (get successful-sales current-rep) u1)
            })
        ))
    ))
)

(define-public (adjust-reputation-score (creator principal) (adjustment int))
    (let (
        (current-rep (get-creator-reputation creator))
        (current-score (get score current-rep))
        (new-score (if (>= adjustment 0)
                       (+ current-score (to-uint adjustment))
                       (if (>= current-score (to-uint (- 0 adjustment)))
                           (- current-score (to-uint (- 0 adjustment)))
                           u0)))
    )
    (begin
        (asserts! (is-eq tx-sender contract-owner) ERR-NOT-AUTHORIZED)
        (ok (map-set creator-reputations
            { creator: creator }
            (merge current-rep { score: new-score })
        ))
    ))
)

