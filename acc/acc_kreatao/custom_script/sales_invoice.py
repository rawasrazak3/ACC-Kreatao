import frappe

@frappe.whitelist()
def purchase_invoice_prices(item_code):
    results = {'buying_price_1': False, 'buying_price_2': False, 'buying_price_3': False}

    purchase_invoices = frappe.get_all(
        'Purchase Invoice Item',
        filters={'item_code': item_code},
        fields=['parent', 'rate'],
        order_by='creation desc',
        limit=3
    )

    for i, invoice_item in enumerate(purchase_invoices):
        results[f'buying_price_{i+1}'] = invoice_item.rate

    return results