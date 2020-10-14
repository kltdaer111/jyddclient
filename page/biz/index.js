import lifecycle from '/util/lifecycle';

Page({
  ...lifecycle,
  data: {
    pageName: 'biz/index',
    pageInfo: {
      pageId: 0,
    },
    curIndex: 0,
    arr: {
      onItemTap: 'onGridItemTap',
      list: [{
        icon: '/image/biz_grid.png',
        title: '今日人员分布',
        entitle: 'stuff-state',
        page: '/page/biz/pages/grid/index',
      }],
    },
  },
  onGridItemTap(e) {
    const page = this.data.arr.list[e.currentTarget.dataset.index].page;
    dd.navigateTo({ url: page });
  },
});
