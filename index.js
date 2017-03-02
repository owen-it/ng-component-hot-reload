var map = null;
var slice = Array.prototype.slice;
var hasOwnProperty = Object.hasOwnProperty;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var keys = Object.keys;
var kebabCase  = require('./utils').kebabCase;

exports.install = function (angular){
    map = angular.__NG_HOT_MAP || Object.create(null) 
}

exports.register = function(id, component)
{
    map[id] = {
        ctro: component
    }
}

exports.update = function(id, component)
{
    var target = angular.__NG_HOT_MAP[id];
    var app = angular.element(document);
    var $injector = app.injector();

    if ($injector && target) {
        var $component = $injector.get(`${target.name}Directive`)[0];
        var $compile   = $injector.get('$compile');
        
        if ($component) {
            $component.template = component.template || '';

            var originComp = $component.controller.prototype;
            var targetComp = (component.controller || function () { }).prototype;

            var allProps = getOwnPropertyNames(targetComp);
            var selProps = keys(targetComp);

            var finallyProps = allProps.filter(function (key) {
                return selProps.indexOf(key) === -1 && key !== 'constructor';
            });

            selProps.forEach(function (prop) {
                originComp[prop] = targetComp[prop];
            });
        
            slice.call(app.find(kebabCase(target.name))).forEach(function(element){
                var $element = angular.element(element);
                $element.html($component.template);
                $compile($element.contents())($element.isolateScope());
            });

            app.find('html').scope().$apply();
            console.info(`[NGC] Hot reload ${target.name} from ng-component-load`)
        }
    }
}
