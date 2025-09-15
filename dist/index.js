// sk
// 2025 © ITAMAESAN ORG. All rights reserved.
// ./dist/index.js

import {
    z as c
} from "zod";

function b(t, e) {
    if (!t) throw new Error(e)
}
var H = async t => {
    try {
        return [null, await t]
    } catch (e) {
        return [e instanceof Error ? e : new Error(String(e)), null]
    }
}, L = t => {
    if (t == null) return 0;
    if (typeof t == "number") return t;
    let e = Number.parseInt(t, 10);
    return Number.isNaN(e) ? 0 : e
}, Y = t => {
    if (t == null) return null;
    try {
        return JSON.parse(t)
    } catch {
        return null
    }
};
var pt = t => t.toString().replace(/\\/g, "\\\\").replace(/"/g, '\\"'),
    Q = t => Object.entries(t).map(([e, n]) => `${e}:"${pt(n)}"`).join(" AND ").trim();

function q(t) {
    return t.toSorted((e, n) => {
        let a = Number(e.metadata.order),
            o = Number(n.metadata.order);
        return Number.isNaN(a) && Number.isNaN(o) || a === o ? n.updated - e.updated : Number.isNaN(a) ? 1 : Number.isNaN(o) ? -1 : a - o
    })
}
var lt = c.object({
    category: c.string().optional(),
    order: c.coerce.number().optional(),
    slug: c.string(),
    variant: c.string().optional(),
    stock: c.coerce.number().optional().transform(t => t === void 0 ? 1 / 0 : t),
    digitalAsset: c.string().optional(),
    preview: c.string().optional()
});

function O({
    default_price: t,
    marketing_features: e,
    ...n
}) {
    return b(t, "Product must have a default price"), b(typeof t == "object", "Product default price must be an object"), {
        ...n,
        default_price: t,
        marketing_features: e.map(a => a.name).filter(Boolean),
        metadata: lt.parse(n.metadata)
    }
}

function mt(t) {
    return !!(t.active && !t.deleted && t.default_price)
}

function W(t) {
    return {
        ...t,
        data: t.data.filter(mt)
    }
}

function K(t) {
    return t.data.map(O)
}

function Z(t) {
    return t
}

function tt(t) {
    return t.data.map(Z)
}

function V(t) {
    return t.filter((e, n, a) => n === a.findIndex(o => o.metadata.slug === e.metadata.slug))
}
var et = t => !t.deleted && t.active,
    F = c.object({
        shippingRateId: c.string().optional(),
        taxCalculationId: c.string().optional(),
        taxCalculationExp: c.string().optional(),
        taxId: c.string().optional(),
        couponCode: c.string().optional(),
        taxedAmount: c.string().optional(),
        "billingAddress.city": c.string().optional(),
        "billingAddress.country": c.string().optional(),
        "billingAddress.line1": c.string().optional(),
        "billingAddress.line2": c.string().optional(),
        "billingAddress.name": c.string().optional(),
        "billingAddress.postalCode": c.string().optional(),
        "billingAddress.state": c.string().optional(),
        netAmount: c.string().optional(),
        taxBreakdown0: c.string().optional(),
        taxBreakdown1: c.string().optional(),
        taxBreakdown2: c.string().optional(),
        taxBreakdown3: c.string().optional(),
        taxBreakdown4: c.string().optional(),
        taxBreakdown5: c.string().optional()
    }).and(c.record(c.string())),
    rt = c.object({
        taxType: c.string(),
        taxPercentage: c.string(),
        taxAmount: c.number()
    });

function z(t) {
    let e = t.payment_method;
    b(typeof e != "string", "Payment method should not be a string");
    let n = t.customer;
    b(typeof n != "string" && !n?.deleted, "Customer should not be a string");
    let a = F.parse(t.metadata),
        o = Object.entries(a).filter(([r]) => r.startsWith("taxBreakdown")).map(([r, i]) => {
            let u = rt.safeParse(Y(String(i)));
            return u.success ? u.data : null
        }).filter(Boolean);
    return {
        ...t,
        metadata: a,
        customer: n,
        payment_method: e,
        taxBreakdown: o
    }
}

function nt({
    payment_method: t,
    latest_charge: e,
    ...n
}) {
    b(typeof t == "object", "Payment method is missing from order"), b(typeof e == "object", "Latest charge is missing from order");
    let a = F.parse(n.metadata),
        o = Object.entries(a).filter(([r]) => r.startsWith("taxBreakdown")).map(([r, i]) => {
            let u = rt.safeParse(Y(String(i)));
            return u.success ? u.data : null
        }).filter(Boolean);
    return {
        ...n,
        payment_method: t,
        latest_charge: e,
        taxBreakdown: o,
        metadata: a
    }
}
import {
    revalidateTag as P
} from "next/cache";
import v from "stripe";
import {
    z as S
} from "zod";
var l = async () => {
    let t = {
        stripeAccount: void 0,
        storeId: void 0,
        secretKey: void 0,
        publishableKey: void 0
    };
    return await global?.__skFindStripeAccount?.() ?? t
};
import at from "stripe";
var ft = process.env.STRIPE_SECRET_KEY,
    gt = process.env.STRIPE_CURRENCY,
    y = {
        StripeSecretKey: ft,
        StripeCurrency: gt
    };
var yt = (t, e) => !t || !e ? t : [...t, `prefix-${e}`, ...t.map(n => `${e}-${n}`)],
    m = ({
        tags: t,
        revalidate: e,
        cache: n,
        tagPrefix: a,
        secretKey: o
    }) => {
        let r = o ?? y.StripeSecretKey;
        if (!r) throw new Error("Missing `secretKey` parameter and `STRIPE_SECRET_KEY` env variable.");
        let i = yt(t, a);
        return new at(r, {
            typescript: !0,
            apiVersion: "2025-01-27.acacia",
            httpClient: at.createFetchHttpClient((f, s) => fetch(f, {
                ...s,
                cache: n ?? s?.cache,
                next: {
                    tags: i ?? s?.next?.tags,
                    revalidate: e ?? s?.next?.revalidate
                }
            })),
            appInfo: {
                name: "Store Kit SDK",
                version: "beta",
                url: "https://epicevils.com",
               partner_id: "PENC-000000"
            }
        })
    };
var R = {
        DEBUG: 0,
        LOG: 1,
        WARN: 2,
        ERROR: 3
    },
    ht = "LOG",
    xt = process.env.LOG_LEVEL && process.env.LOG_LEVEL in R ? process.env.LOG_LEVEL : ht,
    T = R[xt],
    d = {
        time(t) {
            T > R.DEBUG || console.time(t)
        },
        timeEnd(t) {
            T > R.DEBUG || console.timeEnd(t)
        },
        log(...t) {
            T > R.LOG || console.log(...t)
        },
        dir(t, e) {
            T > R.LOG || console.dir(t, e)
        },
        warn(...t) {
            T > R.WARN || console.warn(...t)
        },
        error(...t) {
            T > R.ERROR || console.error(...t)
        }
    };
var C = t => t.filter(Boolean),
    x = {
        accountGetById: {
            tags: ({
                accountId: t
            }) => C(["account", t && `account-${t}`]),
            revalidate: () => {}
        },
        cartGetById: {
            tags: ({
                cartId: t
            }) => C(["cart", `cart-${t}`]),
            revalidate: () => {}
        },
        createTaxCalculation: {
            tags: ({
                cartId: t
            }) => C(["tax-calculations", `tax-calculations-${t}`]),
            revalidate: () => {}
        },
        fileGetById: {
            tags: ({
                fileId: t
            }) => C(["files", `file-${t}`]),
            revalidate: () => {}
        },
        orderGetById: {
            tags: ({
                orderId: t
            }) => C(["order", `order-${t}`]),
            revalidate: () => {}
        },
        productBrowse: {
            tags: ({
                category: t
            }) => C(["product", t && `category-${t}`]),
            revalidate: () => {}
        },
        productGetById: {
            tags: ({
                productId: t
            }) => C(["product", `product-${t}`]),
            revalidate: () => {}
        },
        productGetBySlug: {
            tags: ({
                productSlug: t
            }) => C(["product", `product-${t}`]),
            revalidate: () => {}
        },
        shippingBrowse: {
            tags: () => C(["shipping"]),
            revalidate: () => {}
        },
        shippingGetById: {
            tags: ({
                shippingId: t
            }) => C(["shipping", `shipping-${t}`]),
            revalidate: () => {}
        },
        taxDefaultGet: {
            tags: () => C(["tax-settings"]),
            revalidate: () => {}
        }
    };
import {
    neon as wt
} from "@neondatabase/serverless";
var B;
process.env.DATABASE_URL && (B = wt(process.env.DATABASE_URL));
var j = 1e3;

function ie({
    productId: t,
    cartId: e
}) {
    return e ? _t({
        cartId: e,
        productId: t,
        operation: "INCREASE",
        clearTaxCalculation: !0
    }) : Ct({
        productId: t
    })
}
async function _t({
    productId: t,
    cartId: e,
    operation: n,
    clearTaxCalculation: a
}) {
    let [o, r] = await Promise.all([k(t), ct(e)]);
    if (!o) throw new Error(`Product not found: ${t}`);
    if (!r) throw new Error(`Cart not found: ${e}`);
    if (o.metadata.stock <= 0) throw Error(`Product ${t} is out of stock`);
    if (!y.StripeCurrency) throw new Error("Missing `STRIPE_CURRENCY` env variable");
    if (y.StripeCurrency.toLowerCase() !== o.default_price.currency.toLowerCase()) throw new Error(`Product currency ${o.default_price.currency} does not match cart currency ${y.StripeCurrency}`);
    let i = r.cart.metadata ?? {},
        s = L(i[t]) + (n === "INCREASE" ? 1 : -1);
    s <= 0 ? i[t] = "" : i[t] = s.toString();
    let w = Rt(r) + (o.default_price.unit_amount ?? 0);
    try {
        return await E({
            paymentIntentId: e,
            data: {
                metadata: i,
                amount: w || j
            },
            clearTaxCalculation: a
        })
    } catch (h) {
        d.error(h)
    } finally {
        P(`cart-${e}`)
    }
}
async function $(t) {
    let {
        stripeAccount: e,
        storeId: n,
        secretKey: a
    } = await l(), o = m({
        secretKey: a,
        tagPrefix: n,
        tags: x.cartGetById.tags({
            cartId: t
        }),
        cache: "force-cache"
    });
    try {
        let r = await o.paymentIntents.retrieve(t, {
            expand: ["payment_method", "customer"]
        }, {
            stripeAccount: e
        });
        if (it.includes(r.status)) {
            let i = z(r);
            if (!i) return null;
            let u = await X(i.metadata),
                {
                    metadata: {
                        shippingRateId: f
                    }
                } = i,
                s = f && await N(f);
            return {
                cart: i,
                lines: u.map(({
                    product: w,
                    quantity: h
                }) => w ? {
                    product: w,
                    quantity: h
                } : null).filter(Boolean),
                shippingRate: s || null
            }
        }
    } catch (r) {
        if (d.error(r), r instanceof v.errors.StripeError && r.code === "resource_missing") return null;
        throw r
    }
}
async function Ct({
    productId: t
} = {}) {
    let {
        stripeAccount: e,
        storeId: n,
        secretKey: a
    } = await l(), o = m({
        secretKey: a,
        tagPrefix: n,
        cache: "no-cache"
    });
    if (!y.StripeCurrency) throw new Error("Missing `STRIPE_CURRENCY` env variable");
    try {
        let r = t ? await k(t) : null;
        if (r && r.metadata.stock <= 0) throw Error(`Product ${t} is out of stock`);
        return await o.paymentIntents.create({
            currency: y.StripeCurrency,
            amount: r?.default_price.unit_amount || j,
            automatic_payment_methods: {
                enabled: !0
            },
            metadata: {
                ...r && {
                    [r.id]: "1"
                }
            }
        }, {
            stripeAccount: e
        })
    } catch (r) {
        throw d.error(r), r
    }
}
async function se({
    cart: t,
    add: e
}) {
    if (!e) return t;
    let n = await k(e);
    if (!n) return d.warn(`Product not found: ${e}`), t;
    let o = (t?.lines.find(i => i.product.id === e) ? t.lines : [...t?.lines ?? [], {
            product: n,
            quantity: 0
        }]).map(i => i.product.id === e ? {
            ...i,
            quantity: i.quantity + 1
        } : i),
        r = t ? U(t) + (n.default_price.unit_amount ?? 0) : n.default_price.unit_amount ?? 0;
    return {
        ...t,
        cart: {
            ...t?.cart,
            amount: r
        },
        lines: o
    }
}
async function ce({
    cartId: t,
    productId: e,
    quantity: n
}) {
    let [a, o] = await Promise.all([J(e), $(t)]);
    if (!a) throw new Error(`Product not found: ${e}`);
    if (!o) throw new Error(`Cart not found: ${t}`);
    if (y.StripeCurrency?.toLowerCase() !== a.default_price.currency.toLowerCase()) throw new Error(`Product currency ${a.default_price.currency} does not match cart currency ${y.StripeCurrency}`);
    let r = o.cart.metadata ?? {};
    n <= 0 ? r[e] = "" : r[e] = n.toString();
    let i = U(o) + (a.default_price.unit_amount ?? 0);
    try {
        return await E({
            paymentIntentId: t,
            data: {
                metadata: r,
                amount: i || j
            }
        })
    } catch (u) {
        d.error(u)
    } finally {
        P(`cart-${t}`)
    }
}
async function J(t) {
    let {
        stripeAccount: e,
        storeId: n,
        secretKey: a
    } = await l(), o = m({
        secretKey: a,
        tagPrefix: n,
        tags: x.productGetById.tags({
            productId: t
        }),
        cache: "force-cache"
    });
    try {
        let r = await o.products.retrieve(t, {
            expand: ["default_price"]
        }, {
            stripeAccount: e
        });
        return O(r)
    } catch (r) {
        if (r instanceof v.errors.StripeError && r.code === "resource_missing") return null;
        throw r
    }
}
async function ue({
    slug: t
}) {
    let {
        stripeAccount: e,
        storeId: n,
        secretKey: a
    } = await l(), r = await m({
        secretKey: a,
        tagPrefix: n,
        tags: x.productGetBySlug.tags({
            productSlug: t
        }),
        cache: "force-cache"
    }).products.search({
        query: Q({
            active: !0,
            'metadata["slug"]': t
        }),
        expand: ["data.default_price"]
    }, {
        stripeAccount: e
    });
    if (r.data.length > 1 && r.data.some(i => !i.metadata.variant)) throw new Error(`Multiple products found with the same slug (${t}) but no variant set.`);
    return await Promise.allSettled(r.data.map(i => J(i.id))), q(K(W(r)))
}
async function St(t) {
    let {
        stripeAccount: e,
        storeId: n,
        secretKey: a
    } = await l();
    if (t.filter?.category) {
        let i = t.filter?.category,
            f = await m({
                secretKey: a,
                tagPrefix: n,
                tags: x.productBrowse.tags({
                    category: i
                }),
                cache: "force-cache"
            }).products.search({
                limit: 100,
                query: Q({
                    active: !0,
                    'metadata["category"]': i
                }),
                expand: ["data.default_price"]
            }, {
                stripeAccount: e
            });
        return q(V(K(W(f)))).slice(t.offset || 0, t.first)
    }
    let r = await m({
        secretKey: a,
        tagPrefix: n,
        tags: x.productBrowse.tags({}),
        cache: "force-cache"
    }).products.list({
        limit: 100,
        active: !0,
        expand: ["data.default_price"]
    }, {
        stripeAccount: e
    });
    return q(V(K(W(r))).filter(et)).slice(t.offset || 0, t.first)
}
async function de() {
    let {
        stripeAccount: t,
        storeId: e,
        secretKey: n
    } = await l(), o = await m({
        secretKey: n,
        tagPrefix: e,
        tags: x.shippingBrowse.tags(),
        cache: "force-cache"
    }).shippingRates.list({
        active: !0
    }, {
        stripeAccount: t
    });
    return tt(o)
}
async function N(t) {
    let {
        stripeAccount: e,
        storeId: n,
        secretKey: a
    } = await l(), o = m({
        secretKey: a,
        tagPrefix: n,
        tags: x.shippingGetById.tags({
            shippingId: t
        }),
        cache: "force-cache"
    });
    try {
        let r = await o.shippingRates.retrieve(t, {}, {
            stripeAccount: e
        });
        return r
    } catch (r) {
        if (d.error(r), r instanceof v.errors.StripeError && r.code === "resource_missing") return null;
        throw r
    }
}
async function pe() {
    let e = (await St({
            first: 100
        })).map(a => a.metadata.category).filter(Boolean),
        n = new Set(e);
    return Array.from(n)
}
async function le(t) {
    let {
        stripeAccount: e,
        storeId: n,
        secretKey: a
    } = await l(), o = m({
        secretKey: a,
        tagPrefix: n,
        tags: x.fileGetById.tags({
            fileId: t
        }),
        cache: "force-cache"
    });
    try {
        return await o.fileLinks.create({
            file: t
        }, {
            stripeAccount: e
        })
    } catch (r) {
        if (d.error(r), r instanceof v.errors.StripeError && r.code === "resource_missing") return null;
        throw r
    }
}
async function me() {
    let {
        stripeAccount: t,
        storeId: e,
        secretKey: n
    } = await l(), a = m({
        secretKey: n,
        tagPrefix: e,
        tags: x.accountGetById.tags({}),
        cache: "force-cache"
    });
    try {
        let [o, r] = await H(a.accounts.retrieve({
            expand: ["settings.branding.logo"]
        }, {
            stripeAccount: t
        })), i = r?.settings?.branding.logo ?? null;
        return !i || typeof i == "string" ? {
            account: r,
            logo: null
        } : {
            account: r,
            logo: i
        }
    } catch (o) {
        if (d.error(o), o instanceof v.errors.StripeError && o.code === "resource_missing") return null;
        throw o
    }
}
async function bt(t) {
    let {
        stripeAccount: e,
        storeId: n,
        secretKey: a
    } = await l(), o = m({
        secretKey: a,
        tagPrefix: n,
        tags: x.orderGetById.tags({
            orderId: t
        }),
        cache: "force-cache"
    });
    try {
        let r = await o.paymentIntents.retrieve(t, {
            expand: ["payment_method", "latest_charge", "customer"]
        }, {
            stripeAccount: e
        });
        return nt(r)
    } catch (r) {
        if (r instanceof v.errors.StripeError && r.code === "resource_missing") return null;
        throw r
    }
}
async function fe(t) {
    let e = await bt(t);
    if (!e) return null;
    let n = st(e.metadata),
        a = await Promise.all(n.map(async ([i, u]) => ({
            product: await k(i),
            quantity: u
        }))),
        {
            metadata: {
                shippingRateId: o
            }
        } = e,
        r = o && await N(o);
    return {
        order: e,
        lines: a.map(({
            product: i,
            quantity: u
        }) => i ? {
            product: i,
            quantity: u
        } : null).filter(Boolean),
        shippingRate: r || null
    }
}
var k = async t => {
    let {
        stripeAccount: e,
        storeId: n,
        secretKey: a
    } = await l(), o = m({
        secretKey: a,
        tagPrefix: n,
        tags: x.productGetById.tags({
            productId: t
        }),
        cache: "force-cache"
    });
    try {
        let r = await o.products.retrieve(t, {
            expand: ["default_price"]
        }, {
            stripeAccount: e
        });
        return O(r)
    } catch (r) {
        if (r instanceof v.errors.StripeError && r.code === "resource_missing") return null;
        throw r
    }
}, it = ["requires_action", "requires_confirmation", "requires_capture", "requires_payment_method"], st = t => Object.entries(t ?? {}).filter(([e]) => e.startsWith("prod_")).map(([e, n]) => [e, L(n)]).filter(([, e]) => e && Number.isFinite(e) && e > 0), vt = async t => {
    let {
        stripeAccount: e,
        storeId: n,
        secretKey: a
    } = await l(), o = m({
        secretKey: a,
        tagPrefix: n,
        tags: x.cartGetById.tags({
            cartId: t
        }),
        cache: "force-cache"
    });
    try {
        let r = await o.paymentIntents.retrieve(t, {
                expand: ["payment_method"]
            }, {
                stripeAccount: e
            }),
            i = typeof r.customer == "string" ? await ut(r.customer) : null;
        if (it.includes(r.status)) return z({
            ...r,
            customer: i
        })
    } catch (r) {
        if (d.error(r), r instanceof v.errors.StripeError && r.code === "resource_missing") return null;
        throw r
    }
};
async function X(t) {
    let e = st(t);
    return await Promise.all(e.map(async ([a, o]) => ({
        product: await k(a),
        quantity: o
    })))
}
var ct = async t => {
    let e = await vt(t);
    if (!e) return null;
    let n = await X(e.metadata),
        {
            metadata: {
                shippingRateId: a
            }
        } = e,
        o = a && await N(a);
    return {
        cart: e,
        lines: n.map(({
            product: r,
            quantity: i
        }) => r ? {
            product: r,
            quantity: i
        } : null).filter(Boolean),
        shippingRate: o || null
    }
}, Rt = t => t ? t.cart.metadata?.taxCalculationId ? t.cart.amount : (t.shippingRate?.fixed_amount?.amount ?? 0) + t.lines.reduce((e, {
    product: n,
    quantity: a
}) => e + (n.default_price?.unit_amount ?? 0) * a, 0) : 0, Pt = ["billingAddress.country", "billingAddress.postalCode", "billingAddress.state", "taxId", "shippingRateId", "couponCode"];

function Et({
    oldCart: t,
    data: e,
    mergedMetadata: n,
    lines: a
}) {
    if (!process.env.ENABLE_STRIPE_TAX) return !1;
    let o = Date.now(),
        r = n.taxCalculationExp ? Number.parseInt(n.taxCalculationExp) * 1e3 : null;
    if (!r || o >= r) return !0;
    let i = t.cart.metadata.netAmount || t.cart.amount,
        u = e.amount,
        f = Pt.some(p => !n[p] && !t.cart.metadata[p] ? !1 : n[p] !== t.cart.metadata[p]),
        s = a.length !== t.lines.length || a.some(p => {
            let _ = t.lines.find(A => A.product.id === p.product?.id);
            return p.product?.default_price.unit_amount !== _?.product.default_price.unit_amount || p.quantity !== _?.quantity
        });
    return u && i !== u || f || s
}
var ge = t => S.object({
        name: S.string({
            required_error: t.nameRequired
        }).min(1, t.nameRequired),
        city: S.string({
            required_error: t.cityRequired
        }).min(1, t.cityRequired),
        country: S.string({
            required_error: t.countryRequired
        }).min(1, t.countryRequired),
        line1: S.string({
            required_error: t.line1Required
        }).min(1, t.line1Required),
        line2: S.string().optional().nullable().default(""),
        postalCode: S.string({
            required_error: t.postalCodeRequired
        }).min(1, t.postalCodeRequired),
        state: S.string().optional().nullable().default(""),
        phone: S.string().optional().nullable().default(""),
        taxId: S.string().optional().nullable().default(""),
        email: S.string().optional().nullable().default("")
    }),
    At = async ({
        lineItems: t,
        billingAddress: e,
        cartId: n,
        shippingRateId: a,
        taxId: o
    }) => {
        if (!process.env.ENABLE_STRIPE_TAX) return null;
        if (!y.StripeCurrency) throw new Error("Missing `STRIPE_CURRENCY` env variable");
        let {
            stripeAccount: r,
            storeId: i,
            secretKey: u
        } = await l(), f = m({
            secretKey: u,
            tagPrefix: i,
            tags: x.createTaxCalculation.tags({
                cartId: n
            }),
            cache: "force-cache"
        });
        if (!e?.country) return null;
        let s = a ? await N(a) : null,
            w = typeof s?.tax_code == "string" ? s.tax_code : s?.tax_code?.id,
            h = await Bt(),
            p = y.StripeCurrency === "usd" || y.StripeCurrency === "cad" ? "exclusive" : "inclusive",
            _ = h.defaults.tax_behavior === "inferred_by_currency" ? p : h.defaults.tax_behavior ?? p;
        h.defaults.tax_behavior || d.warn(`Tax behavior not set in Stripe settings. Inferring from currency ${y.StripeCurrency}: ${p}.`), d.time("createTaxCalculation ${cartId}");
        let A = await f.tax.calculations.create({
            expand: ["line_items"],
            line_items: t.map(M => ({
                ...M,
                tax_behavior: M.tax_behavior ?? _
            })),
            currency: y.StripeCurrency,
            shipping_cost: s?.active && s?.fixed_amount ? {
                amount: s.fixed_amount.amount,
                tax_behavior: s.tax_behavior === "inclusive" ? "inclusive" : s.tax_behavior === "exclusive" ? "exclusive" : _,
                tax_code: w ?? h.defaults.tax_code ?? void 0
            } : void 0,
            customer_details: {
                tax_ids: o ? [{
                    type: "eu_vat",
                    value: o
                }] : void 0,
                address_source: "billing",
                address: {
                    country: e.country,
                    city: e?.city,
                    line1: e?.line1,
                    line2: e?.line2,
                    postal_code: e?.postalCode,
                    state: e?.state
                }
            }
        }, {
            stripeAccount: r
        });
        return d.timeEnd("createTaxCalculation ${cartId}"), console.log(JSON.stringify(A).length), A
    }, ot = {
        taxBreakdown0: "",
        taxBreakdown1: "",
        taxBreakdown2: "",
        taxBreakdown3: "",
        taxBreakdown4: "",
        taxBreakdown5: ""
    };
async function ut(t) {
    let {
        stripeAccount: e,
        storeId: n,
        secretKey: a
    } = await l(), o = m({
        secretKey: a,
        tagPrefix: n,
        tags: ["customers", `customers-${t}`],
        cache: "force-cache"
    });
    try {
        let r = await o.customers.retrieve(t, {}, {
            stripeAccount: e
        });
        return r.deleted ? null : r
    } catch (r) {
        if (d.error(r), r instanceof v.errors.StripeError && r.code === "resource_missing") return null;
        throw r
    }
}

function It(t, e) {
    return e.coupon.amount_off ? Math.max(t - e.coupon.amount_off, 0) : e.coupon.percent_off ? Math.floor(t * (1 - e.coupon.percent_off / 100)) : t
}
var E = async ({
    paymentIntentId: t,
    data: e,
    customerOverride: n,
    clearTaxCalculation: a
}) => {
    let {
        stripeAccount: o,
        storeId: r,
        secretKey: i
    } = await l(), u = await ct(t);
    b(u, `Cart not found: ${t}`);
    let f = e.amount ? e.amount.toString() : null,
        s = F.parse({
            ...u.cart.metadata,
            ...e.metadata
        });
    d.time("getProductsFromMetadata");
    let w = await X(s);
    d.timeEnd("getProductsFromMetadata");
    let h = !a && Et({
        oldCart: u,
        data: e,
        mergedMetadata: s,
        lines: w
    });
    console.log({
        shouldRecalculateTax: h
    });
    let p = h ? await At({
            cartId: t,
            taxId: s.taxId ?? null,
            shippingRateId: s.shippingRateId ?? null,
            billingAddress: {
                country: s["billingAddress.country"] ?? "",
                city: s["billingAddress.city"] ?? "",
                line1: s["billingAddress.line1"] ?? "",
                line2: s["billingAddress.line2"] ?? "",
                name: s["billingAddress.name"] ?? "",
                postalCode: s["billingAddress.postalCode"] ?? "",
                state: s["billingAddress.state"] ?? ""
            },
            lineItems: w.map(({
                product: g,
                quantity: G
            }) => {
                if (g?.default_price.unit_amount) return {
                    product: g.id,
                    reference: [g.metadata.slug, g.metadata.variant].filter(Boolean).join("-"),
                    quantity: G,
                    amount: g.default_price.unit_amount * G,
                    tax_behavior: g.default_price.tax_behavior === "exclusive" ? "exclusive" : g.default_price.tax_behavior === "inclusive" ? "inclusive" : void 0,
                    tax_code: g.tax_code ? typeof g.tax_code == "string" ? g.tax_code : g.tax_code.id : void 0
                }
            }).filter(Boolean)
        }) : null,
        _ = n ?? (e.customer ? await ut(e.customer) : u.cart.customer);
    console.log({
        customer: _
    });
    let A = m({
        secretKey: i,
        tagPrefix: r,
        cache: "no-cache"
    });
    d.time(`paymentIntents.update ${t}`);
    let M = p && Object.fromEntries(p.tax_breakdown.map(g => ({
            taxType: g.tax_rate_details.tax_type,
            taxPercentage: g.tax_rate_details.percentage_decimal,
            taxAmount: g.amount
        })).map((g, G) => [`taxBreakdown${G}`, JSON.stringify(g)])),
        I = p ? p.amount_total : e.amount,
        D = I && _?.discount?.coupon.valid ? It(I, _.discount) : I;
    console.log({
        "discount.coupon.amount_off": _?.discount?.coupon.amount_off,
        "discount.coupon.percent_off": _?.discount?.coupon.percent_off,
        discountedAmount: D,
        taxedAmount: I,
        "taxCalculation.amount_total": p?.amount_total,
        "data.amount": e.amount,
        netAmount: f
    });
    let dt = await A.paymentIntents.update(t, {
        ...e,
        ...D && {
            amount: D
        },
        metadata: {
            ...s,
            ...f && {
                netAmount: f
            },
            ...I && {
                taxedAmount: I
            },
            ...p ? {
                ...ot,
                ...M,
                taxCalculationId: p.id,
                taxCalculationExp: p?.expires_at
            } : {
                ...a && {
                    ...ot,
                    taxCalculationId: "",
                    taxCalculationExp: ""
                }
            }
        }
    }, {
        stripeAccount: o
    });
    return d.timeEnd(`paymentIntents.update ${t}`), dt
}, U = t => t ? t.cart.metadata?.taxCalculationId ? t.cart.amount : (t.shippingRate?.fixed_amount?.amount ?? 0) + Tt(t) : 0, Tt = t => t ? t.lines.reduce((e, {
    product: n,
    quantity: a
}) => e + (n.default_price?.unit_amount ?? 0) * a, 0) : 0;
async function ye({
    productId: t,
    cartId: e,
    operation: n,
    clearTaxCalculation: a
}) {
    let [o, r] = await Promise.all([J(t), $(e)]);
    if (!o) throw new Error(`Product not found: ${t}`);
    if (!r) throw new Error(`Cart not found: ${e}`);
    if (y.StripeCurrency?.toLowerCase() !== o.default_price.currency.toLowerCase()) throw new Error(`Product currency ${o.default_price.currency} does not match cart currency ${y.StripeCurrency}`);
    let i = r.cart.metadata ?? {},
        s = L(i[t]) + (n === "INCREASE" ? 1 : -1);
    s <= 0 ? i[t] = "" : i[t] = s.toString();
    let w = U(r) + (o.default_price.unit_amount ?? 0);
    try {
        return await E({
            paymentIntentId: e,
            data: {
                metadata: i,
                amount: w || j
            },
            clearTaxCalculation: a
        })
    } catch (h) {
        d.error(h)
    } finally {
        P(`cart-${e}`)
    }
}
var he = async ({
    cartId: t,
    email: e
}) => {
    let n = await $(t);
    if (!n) throw new Error(`Cart not found: ${t}`);
    try {
        return await E({
            paymentIntentId: t,
            data: {
                metadata: {
                    ...n.cart.metadata,
                    email: e
                }
            }
        })
    } catch (a) {
        d.error(a)
    } finally {
        P(`cart-${t}`)
    }
}, xe = async ({
    cartId: t,
    taxId: e
}) => {
    let n = await $(t);
    if (!n) throw new Error(`Cart not found: ${t}`);
    try {
        return await E({
            paymentIntentId: t,
            data: {
                metadata: {
                    ...n.cart.metadata,
                    taxId: e
                }
            }
        })
    } catch (a) {
        d.error(a)
    } finally {
        P(`cart-${t}`)
    }
};
async function we({
    cartId: t,
    shippingRateId: e
}) {
    let n = await $(t);
    if (!n) throw new Error(`Cart not found: ${t}`);
    d.time(`cartSaveShipping ${t}`);
    let a = await N(e);
    if (d.timeEnd(`cartSaveShipping ${t}`), !a) throw new Error(`Shipping rate not found: ${e}`);
    try {
        d.time(`updatePaymentIntent ${t}`);
        let o = await E({
            paymentIntentId: t,
            data: {
                metadata: {
                    ...n.cart.metadata,
                    shippingRateId: e
                },
                amount: U({
                    ...n,
                    shippingRate: a
                })
            }
        });
        return d.timeEnd(`updatePaymentIntent ${t}`), o
    } catch (o) {
        d.error(o)
    } finally {
        P(`cart-${t}`)
    }
}
async function _e({
    cartId: t,
    billingAddress: e
}) {
    if (!await $(t)) throw new Error(`Cart not found: ${t}`);
    try {
        return await E({
            paymentIntentId: t,
            data: {
                metadata: {
                    "billingAddress.name": e.name,
                    "billingAddress.phone": e.phone,
                    "billingAddress.city": e.city,
                    "billingAddress.country": e.country,
                    "billingAddress.line1": e.line1,
                    "billingAddress.line2": e.line2 ?? "",
                    "billingAddress.postalCode": e.postalCode,
                    "billingAddress.state": e.state ?? "",
                    "billingAddress.email": e.email ?? ""
                }
            }
        })
    } catch (a) {
        d.error(a)
    } finally {
        P(`cart-${t}`)
    }
}
async function Bt() {
    let {
        stripeAccount: t,
        storeId: e,
        secretKey: n
    } = await l();
    return await m({
        secretKey: n,
        tagPrefix: e,
        tags: ["tax-settings"],
        cache: "force-cache"
    }).tax.settings.retrieve({}, {
        stripeAccount: t
    })
}

function Ce(t) {
    return Object.entries(t ?? {}).filter(([e]) => e.startsWith("prod_")).map(([e, n]) => [e, L(n)]).filter(([, e]) => e && Number.isFinite(e) && e > 0).length
}
async function Se(t) {
    if (!B) return null;
    let {
        storeId: e
    } = await l();
    return await B`
		select * from reviews
		where product_id = ${t.productId}  and store_id = ${e}
		order by created_at desc
		limit ${t.first??100}
		offset ${t.offset??0}
	`
}
async function be(t) {
    if (!B) return null;
    let {
        storeId: e
    } = await l();
    return await B`
		insert into reviews (store_id, product_id, author, email, content, rating, created_at, updated_at)
		values (${e}, ${t.productId}, ${t.author}, ${t.email}, ${t.content}, ${t.rating}, now(), now())
	`
}
var ve = l;
export {
    me as accountGet, Rt as calculateCartTotalNet, Tt as calculateCartTotalNetWithoutShipping, U as calculateCartTotalPossiblyWithTax, ie as cartAdd, se as cartAddOptimistic, ye as cartChangeQuantity, Ce as cartCount, Ct as cartCreate, $ as cartGet, _e as cartSaveBillingAddress, he as cartSaveEmail, we as cartSaveShipping, xe as cartSaveTax, ce as cartSetQuantity, _t as cartUpdateQuantity, pe as categoryBrowse, ve as contextGet, le as fileGet, ge as getAddressSchema, ct as getCartWithProductsById, st as getProductsFromCart, X as getProductsFromMetadata, fe as orderGet, St as productBrowse, ue as productGet, J as productGetById, be as productReviewAdd, Se as productReviewBrowse, m as provider, de as shippingBrowse, N as shippingGet, Bt as taxDefaultGet, E as updatePaymentIntent
};