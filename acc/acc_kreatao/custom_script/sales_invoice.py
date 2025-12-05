import frappe
from erpnext.stock.stock_ledger import NegativeStockError, get_previous_sle, get_valuation_rate

@frappe.whitelist()
def purchase_invoice_prices(item_code):
    results = {'buying_price_1': False, 'buying_price_2': False, 'buying_price_3': False}

    purchase_invoices = frappe.get_all(
        'Purchase Invoice Item',
        filters={'item_code': item_code, 'docstatus': 1},
        fields=['parent', 'base_rate'],
        order_by='creation desc',
        limit=3
    )

    for i, invoice_item in enumerate(purchase_invoices):
        results[f'buying_price_{i+1}'] = invoice_item.base_rate

    return results

@frappe.whitelist()
def valuation_rate(item_code):
    results = None
    entries = frappe.get_all(
        'Stock Ledger Entry',
        filters={'item_code': item_code, 'is_cancelled': 0},
        fields=['valuation_rate'],
        order_by='posting_date DESC, posting_time DESC, creation DESC',
        limit=1
    )

    if entries:
        results = entries[0].get('valuation_rate')

    return results

# @frappe.whitelist()
# def valuation_rate(item_code):
#     """
#     Fetch the correct valuation rate for the given item using the method from
#     ERPNext's stock entry process.

#     Args:
#         item_code (str): The item code for which valuation rate is needed.

#     Returns:
#         float: The latest valuation rate or None if not found.
#     """
#     try:
#         # Fetch the valuation rate using the core ERPNext function
#         valuation_rate = get_valuation_rate(
#             item_code=item_code,
#             warehouse="Stores - ACC",  # Replace with your default warehouse name
#             doctype='Stock Ledger Entry',  # Refers to Stock Ledger
#             name=None,  # No specific document name required here
#             allow_zero_valuation_rate=False,  # Do not allow zero rates by default
#             currency="OMR",  # Replace with the default currency
#             company="Arabian Computers Company LLC",  # Replace with your company name
#             raise_error_if_no_rate=False  # Avoid raising an error if not found
#         )

#         return valuation_rate

#     except Exception as e:
#         frappe.log_error(frappe.get_traceback(), "Valuation Rate Fetch Error")
#         return None
