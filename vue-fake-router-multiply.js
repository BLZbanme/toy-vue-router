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

function matcher(routes, path, index) {
    let paths = path.split('/');
    for (let routeName in routes) {
        let route = routes[routerName];
        if (route.path.replace(/^\//) === paths[index].replace(/^\//)) {
            if (route.children) {
                let components = matcher(route.children, path, index + 1);
                if (components) {
                    continue;
                }
                return [route.component, ...components];
            }
            else if (index >= paths.length - 1) {
                return [route.component];
            }
            else {
                continue;
            }
        }
    }
}

function getMatchedComponent(routes, path, matchIndex) {
    let matchRes = matcher(routes, path, 0);
    if (!matchRes) {
        return null;
    }

    return {
        ...matchRes[matchIndex - 1]
    }
}

VueRouter.install = function (Vue) {

    Vue.mixin({
        beforeCreate() {
            if (this.$options.router) {
                this.$options.router.init(this)
                this.routerRoot = true;
            }
            else {
                this.routerRoot = (this.$parent && this.$parent.routerRoot);
            }
        },
    })

    Vue.component('router-view', {
        functional: true,
        render(createElement, { props, children, parent, data }) {

            parent.isRouterView = true;
            let depth = 1;
            let searchedParent = parent;

            while (searchedParent 
                && searchedParent.$parent
                && searchedParent.routerRoot !== searchedParent) {
                    if (searchedParent.isRouterView) {
                        depth++;
                    }
                searchedParent = searchedParent.$parent;
            }

            const router = parent.$options.router;
            const path = router.path.replace(/^#\//, '');
            
            const matchedComponent = getMatchedComponent(router.routes, path, depth);

            createElement(
                matchedComponent
            )
        }
    })
}