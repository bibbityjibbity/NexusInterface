import memoize from 'memoize-one';

const getThresholdDate = timeSpan => {
  const now = new Date();
  switch (timeSpan) {
    case 'week':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    case 'month':
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case 'year':
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    default:
      return null;
  }
};

export const getTransactionsList = memoize(
  txMap => txMap && Object.values(txMap)
);

export const getFilteredTransactions = memoize(
  (allTransactions, account, addressQuery, category, minAmount, timeSpan) =>
    allTransactions &&
    allTransactions.filter(tx => {
      // Filter by Address
      if (
        addressQuery &&
        tx.address &&
        !tx.address.toLowerCase().includes(addressQuery.toLowerCase())
      ) {
        return false;
      }

      // Filter by Account
      if (account && tx.account !== account) return false;

      // Filter by Category
      if (category && tx.category !== category) return false;

      // Filter by Amount
      const min = Number(minAmount) || 0;
      if (min && tx.amount < min) return false;

      // Filter by Time
      if (timeSpan) {
        const pastDate = getThresholdDate(timeSpan);
        if (!pastDate) return true;
        else return new Date(tx.time * 1000).getTime() > pastDate.getTime();
      }

      return true;
    })
);

export const getContractList = memoize(txMap => {
  const txList = getTransactionsList(txMap);
  return txList.reduce((list, tx) => {
    if (!tx.contracts) return list;
    const { contracts, ...txInfo } = tx;
    return [...list, ...contracts.map(contract => ({ ...contract, txInfo }))];
  }, []);
});
