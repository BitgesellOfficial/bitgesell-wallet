document.addEventListener('DOMContentLoaded', () => {

	initHtmlElements(
		'#transactions-table',
	);

	const transactionsTable = $('#transactions-table').DataTable(
		$.extend({}, dataTableParams, {
			columns: [
				{ data: 'id', className: 'dtr-control' },
				{ data: 'timestamp', render: dateTimeFormat },
				{ data: 'tx_id', render: (data) => { return `<input type="text" class="form-control-plaintext form-control-sm" value="${data}" readonly="">`; }, width: '30%', class: 'text-center desktop' },
				{ data: 'type', render: (data) => {
					let className = 'danger';
					let text = 'Sended';
					if (data === 0) {
						className = 'success';
						text = 'Received';
					}
					return `<span class="badge badge-${className}">${text}</span>`;
				}, class: 'text-center' },
				{ data: 'amount', render: humanAmountFormat },
				{ data: 'confirmations', className: 'none' },
				{ data: 'block_height', className: 'none' },
				{ data: 'fee', className: 'none', render: humanAmountFormat },
				{ data: 'rbf', className: 'none', render: (data) => { return data ? 'Yes' : 'No'; } },
				{ data: 'coinbase', className: 'none', render: (data) => { return data ? 'Yes' : 'No'; } },
				{ data: 'tx_id', render: (data) => {
					let btns = '';
					btns += `<a class="btn btn-warning btn-sm mr-1" target="_blank" href="https://bgl.bitaps.com/${data}"><i class="icon icon-svg mr-1"></i>Explorer</a>`;
					return btns;
				}, class: 'text-right desktop' },
			],
			fnDrawCallback: () => {
				$transactionsTable.querySelectorAll('input').forEach(($input) => {
					$input.addEventListener('click', () => copyToBuffer($input));
				});
			},
		})
	)
			.on('responsive-display', (e, datatable, row, showHide) => {
				if (showHide) {
					const $row = row.selector.rows[0];
					if ($row) {
						const $subRow = $row.nextElementSibling;
						const $input = $subRow.querySelector('input');
						if ($input) $input.addEventListener('click', (e) => copyToBuffer(e.target));
					}
				}
			});

	window.transactionsTableDraw = () => {
		transactionsTable.clear();
		transactionsTable.draw(false);
		const address = window.location.hash.substring(14);
		getAddressInfo(address, (apiAddressInfo) => {
			const transactionsData = [];
			let countAddresses = 0;
			apiAddressInfo.list = apiAddressInfo.list;
			for (const key in apiAddressInfo.list) {
				countAddresses++;
				const value = apiAddressInfo.list[key];
				transactionsData.push({
					id: countAddresses,
					type: value.addressInputs,
					tx_id: value.txId,
					timestamp: value.timestamp,
					amount: value.amount,
					confirmations: value.confirmations,
					block_height: value.blockHeight,
					rbf: value.rbf,
					coinbase: value.coinbase,
					fee: value.fee,
				});
			}
			transactionsTable.rows.add(transactionsData);
			transactionsTable.draw(false);
		});
	};

	const hash = window.location.hash.substring(1, 13);
	if (hash === 'transactions') {
		window.scrollTo({ top: 0, behavior: 'smooth' });
		transactionsTableDraw();
	}

});

window.navigateTransactions = () => {
	hide($welcome, $dashboard, $newAddress, $send, $myAddresses, $setPassword, $mobileMenu);
	show($main, $transactions);
	transactionsTableDraw();
};
