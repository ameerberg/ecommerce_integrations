// Copyright (c) 2021, Frappe and contributors
// For license information, please see license.txt

frappe.ui.form.on("Unicommerce Shipment Manifest", {
	scan_barcode: function (frm) {
		if (!frm.doc.scan_barcode) {
			return false;
		}

		frappe
			.xcall(
				"ecommerce_integrations.unicommerce.doctype.unicommerce_shipment_manifest.unicommerce_shipment_manifest.search_packages",
				{
					search_term: frm.doc.scan_barcode,
					shipper: frm.doc.shipping_provider_code,
					channel: frm.doc.channel_id,
				}
			)
			.then((invoice) => {
				if (!invoice) {
					frappe.show_alert({
						message: __("Could not find the package."),
						indicator: "red",
					});
					return;
				}

				let cur_grid = frm.fields_dict.manifest_items.grid;

				const already_exists = frm.doc.manifest_items.find(d => d.sales_invoice === invoice);
				if (already_exists) {
					frappe.show_alert({
						message: __("Package already added in this manifest"),
						indicator: "red",
					});
					return;
				}

				let new_row = frappe.model.add_child(
					frm.doc,
					cur_grid.doctype,
					"manifest_items"
				);

				frappe.model.set_value(
					new_row.doctype,
					new_row.name,
					"sales_invoice",
					invoice
				);
			})
			.finally(() => {
				frm.fields_dict.scan_barcode.set_value("");
				refresh_field("manifest_items");
			});
	},
});
