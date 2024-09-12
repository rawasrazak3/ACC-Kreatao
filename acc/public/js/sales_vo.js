frappe.ui.form.on('Sales Invoice', {
	refresh(frm) {
        //
	}
});


frappe.ui.form.on('Sales Invoice Item', {
    item_code: function(frm, cdt, cdn) {
        var child = locals[cdt][cdn];
        var item_code = child.item_code;

        frm.clear_table('custom_item_prices');

        frappe.call({
            method: 'acc.acc_kreatao.custom_script.sales_invoice.purchase_invoice_prices',
            args: {
                item_code: item_code
            },
            callback: function(r) {
                if (r.message) {
                    console.log("Response from Server:", r.message);

                    var new_row = frm.add_child('custom_item_prices', { item_code: item_code });

                    var buying_price_1 = r.message.buying_price_1 || 0;
                    var buying_price_2 = r.message.buying_price_2 || 0;
                    var buying_price_3 = r.message.buying_price_3 || 0;

                    frappe.model.set_value(new_row.doctype, new_row.name, 'buying_price_1', buying_price_1);
                    frappe.model.set_value(new_row.doctype, new_row.name, 'buying_price_2', buying_price_2);
                    frappe.model.set_value(new_row.doctype, new_row.name, 'buying_price_3', buying_price_3);

                    frappe.call({
                        method: 'acc.acc_kreatao.custom_script.sales_invoice.valuation_rate',
                        args: {
                            item_code: item_code
                        },
                        callback: function(r) {
                            var valuation_rate = r.message || 0;
                            console.log("Valuation Rate:", valuation_rate);

                            frappe.model.set_value(new_row.doctype, new_row.name, 'valuation_rate', valuation_rate);
                            frm.refresh_field('custom_item_prices');
                        }
                    });

                    console.log("Setting Prices:", buying_price_1, buying_price_2, buying_price_3);
                }
            }
        });
    }
});

frappe.ui.form.on('Sales Invoice Item', {
    item_code: function (frm, cdt, cdn) {
        var child = locals[cdt][cdn];
        var item_code = child.item_code;

        frappe.call({
            method: 'acc.acc_kreatao.custom_script.sales_invoice.valuation_rate', 
            args: {
                item_code: item_code
            },
            callback: function (r) {
                if (r.message) {
                    frappe.model.set_value(cdt, cdn, 'custom_valuation_rate', r.message);
                    frm.refresh_field('items');
                }
            }
        });
    }
});

frappe.ui.form.on('Sales Invoice', {
    validate: function(frm) {
        let is_undercost = false;
        let is_negative_stock = false;

        frm.doc.items.forEach(function(item) {
            if (item.rate < item.custom_valuation_rate) {
                is_undercost = true;
            }

            if (item.qty > item.actual_qty) {
                is_negative_stock = true;
            }
        });

        frm.set_value('custom_is_undercost', is_undercost ? 1 : 0);
        frm.set_value('custom_is_negative_stock', is_negative_stock ? 1 : 0);
    }
});
