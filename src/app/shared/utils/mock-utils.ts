export const MOCK_FILTER_FROM = '_From';
export const MOCK_FILTER_TO = '_To';

export const findItemInMock = <T>(mockData: T[], id: unknown, idNameField: string = 'id'): T =>
  mockData.find(item => item[idNameField] === id);

// export const getPaginationListFromMock = <T>(mockData: T[], params: ListParams): Paginator<T> => {
//   const sotredAndFilteredData = filterMockData(sortMockData(mockData, params), params.filters);
//
//   return {
//     page: params.page,
//     limit: params.limit,
//     total: sotredAndFilteredData.length,
//     pages: Math.ceil(sotredAndFilteredData.length / params.limit),
//     sort: params.sort ? params.sort.field : undefined,
//     direction: params.sort ? params.sort.direction : undefined,
//     items: sotredAndFilteredData.slice(params.page * params.limit, (params.page + 1) * params.limit)
//   } as Paginator<T>;
// };

export const sortMockData = (
  mockData: Record<string, unknown>[],
  params: { sort?: { field: string; direction: string } }
): Record<string, unknown>[] => {
  if (params.sort && params.sort.field && params.sort.direction === 'asc') {
    return mockData.sort((a, b) => (a[params.sort!.field] > b[params.sort!.field] ? 1 : -1));
  } else if (params.sort && params.sort.field && params.sort.direction === 'desc') {
    return mockData.sort((a, b) => (a[params.sort!.field] > b[params.sort!.field] ? -1 : 1));
  }
  return mockData;
};

export const filterMockData = (
  mockData: Record<string, unknown>[],
  filters: Record<string, unknown>
): Record<string, unknown>[] => {
  if (!filters || !Object.keys(filters).length) {
    return mockData;
  }

  return mockData.filter(item => {
    let allFiltersMet = true;

    Object.keys(filters).forEach(element => {
      if (filters[element]) {
        if (element.includes(MOCK_FILTER_FROM)) {
          const itemName = element.split(MOCK_FILTER_FROM).join('');
          if ((item[itemName] as number) < (filters[element] as number)) {
            allFiltersMet = false;
          }
        } else if (element.includes(MOCK_FILTER_TO)) {
          const itemName = element.split(MOCK_FILTER_TO).join('');
          if ((item[itemName] as number) > (filters[element] as number)) {
            allFiltersMet = false;
          }
        } else if (
          item[element] !== null &&
          item[element] !== undefined &&
          !String(item[element]).toLowerCase().includes(String(filters[element]).toLowerCase())
        ) {
          allFiltersMet = false;
        }
      }
    });
    if (allFiltersMet) {
      return item;
    }
  });
};
