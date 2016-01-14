/**
 * Created by kevin on 15/12/2015.
 */
//import {describe, it, expect} from 'jasmine';
import angular from 'angular';
import Builder from './builder';

describe('Builder', () => {

    let ngStomp = { subscribe : x => x}, firstTopic = 'aTopic', secondTopic = 'secondTopic';
    let builder;

    let transformToConnection = (topic, callback, headers, scope, json) => ({topic : topic, callback : callback, headers : headers, scope : scope, json : json });

    beforeEach(() => {
        spyOn(ngStomp, 'subscribe').and.returnValue(new Builder(ngStomp, secondTopic));
        builder = new Builder(ngStomp, firstTopic);
    });

    it('should construct a coherent object', () => {
        expect(builder.ngStomp).toBe(ngStomp);
        expect(builder.topic).toBe(firstTopic);
    });

    it('should subscribe with default parameters', () => {
        builder.build();
        expect(ngStomp.subscribe.calls.mostRecent().args).toEqual([firstTopic, angular.noop, {}, {}, false])
    });

    it('should subscribe', () => {
        let aCallback = x => x,
            headers = { foo : 'foo', bar : 'bar'},
            $scope = {};

        let unsubscriber = builder
            .callback(aCallback)
            .withHeaders(headers)
            .bindTo($scope)
            .withBodyInJson()
            .build();

        expect(ngStomp.subscribe.calls.mostRecent().args).toEqual([firstTopic, aCallback, headers, $scope, true]);
        expect(unsubscriber.connections).toEqual([transformToConnection(firstTopic, aCallback, headers, $scope, true)]);
    });

    it('should subscribe with chaining', () => {
        let aCallback = x => x,
            headers = { foo : 'foo', bar : 'bar'},
            $scope = {};

        let unsubscriber = builder
            .callback(aCallback)
            .withHeaders(headers)
            .bindTo($scope)
        .and()
            .subscribeTo(secondTopic)
            .callback(angular.noop)
        .connect();

        expect(ngStomp.subscribe.calls.argsFor(0)).toEqual([firstTopic, aCallback, headers, $scope, false]);
        expect(ngStomp.subscribe.calls.argsFor(1)).toEqual([secondTopic, angular.noop, {}, {}, false]);

        expect(unsubscriber.connections).toEqual([transformToConnection(firstTopic, aCallback, headers, $scope, false), transformToConnection(secondTopic, angular.noop, {}, {}, false)]);
    });


});
