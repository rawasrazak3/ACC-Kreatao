frappe.ui.form.on('Sales Invoice', {
	refresh(frm) {
        //
	}
});


frappe.ui.form.on('Sales Invoice Item', {
    item_code: function(frm, cdt, cdn) {
        var child = locals[cdt][cdn];
        var item_code = child.item_code;

        console.log('Selected Item Code:', item_code);

        frappe.call({
            method: 'acc.acc_kreatao.custom_script.sales_invoice.purchase_invoice_prices',
            args: {
                item_code: item_code
            },
            callback: function(r) {
                console.log('Response from Server:', r.message);

                if (r.message) {
                    if (!frm.doc.custom_item_prices) {
                        frm.set_value('custom_item_prices', []);
                    }

                    var child_row = frm.add_child('custom_item_prices');

                    var buying_price_1 = r.message.buying_price_1 || 0;
                    var buying_price_2 = r.message.buying_price_2 || 0;
                    var buying_price_3 = r.message.buying_price_3 || 0;

                    console.log('Setting Prices:', buying_price_1, buying_price_2, buying_price_3);

                    frappe.model.set_value(child_row.doctype, child_row.name, 'buying_price_1', buying_price_1);
                    frappe.model.set_value(child_row.doctype, child_row.name, 'buying_price_2', buying_price_2);
                    frappe.model.set_value(child_row.doctype, child_row.name, 'buying_price_3', buying_price_3);

                    frm.refresh_field('custom_item_prices');
                }
            }
        });
    }
});

