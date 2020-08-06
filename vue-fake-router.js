export default class VueRouter {
    constructor({ routes }) {
        this.routes = routes;
        this.history = new History();
        this.path = window.location.hash;
        this.history.listen((path) => {
            this.path = path;
            console.log('vm:', this.vm);
            this.vm.$forceUpdate();
        });
    }

    init(vm) {
        this.vm = vm;
    }
}

class History {
    listen(callback) {
        window.addEventListener('hashchange', function () {
            console.log('hash-change', window.location.hash);
            callback && callback(window.location.hash);
        })
    }
}

VueRouter.install = function (Vue) {

    Vue.mixin({
        beforeCreate() {
            if (this.$options.router) {
                this.$options.router.init(this)
            }
        },
    })

    Vue.component('router-view', {
        functional: true,
        render(createElement, { props, children, parent, data }) {
            const router = parent.$options.router;
            const path = router.path;
            
            const matchRoute = router.routes.find(route => {
                route.path.replace(/^\//, "") === path.replace(/^#\//, "")
            })

            const matchedComponent = matchRoute.component;

            createElement(
                matchedComponent
            )
        }
    })
}