import React, { Component } from 'react';
import * as THREE from 'three';
import styled from '@emotion/styled';
import orbitControl from 'three-orbit-controls';

import world from 'icons/world-light-white.jpg';
import geoip from 'data/geoip';
import Curve from './Curve';
import Point from './Point';
import rpc from 'lib/rpc';
import { apiPost } from 'lib/tritiumApi';

const OrbitControls = orbitControl(THREE);
const MaxDisplayPoints = 64;

const GlobeContainer = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
});

/**
 * The 3D Globe on the overview page.
 *
 * @export
 * @class Globe
 * @extends {Component}
 */
export default class Globe extends Component {
  constructor() {
    super();
    this.threeRootElement = null;
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.animateArcs = this.animateArcs.bind(this);
    this.pointRegister = this.pointRegister.bind(this);
    this.contextLostHandler = this.contextLostHandler.bind(this);
    this.contextRestoredHandler = this.contextRestoredHandler.bind(this);
    this.pointRegistry = [];
    this.curveRegistry = [];
    this.timesSkipped = 0;
  }

  /**
   * Mounting event from React, used to start the globe up
   *
   * @memberof Globe
   */
  componentDidMount() {
    try {
      this.props.handleOnLineRender(this.animateArcs);
      this.props.handleRemoveAllPoints(this.removeAllPoints);

      const WIDTH = window.innerWidth;
      const HEIGHT = window.innerHeight;
      const VIEW_ANGLE = 45;
      const ASPECT = WIDTH / HEIGHT;
      const NEAR = 0.1;
      const FAR = 10000;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      const camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
      const scene = new THREE.Scene();

      const controls = new OrbitControls(camera);
      const globe = new THREE.Group();
      const sphere = new THREE.SphereGeometry(125, 50, 50);
      const allPoints = new THREE.Group();
      const allArcs = new THREE.Group();

      renderer.setClearColor(0x000000, 0);
      renderer.setSize(WIDTH, HEIGHT);
      camera.position.set(0, 235, 500);
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.8;
      controls.minDistance = 300;
      controls.maxDistance = 500;
      controls.enablePan = false;
      // Disabled by default, fixing a bug where the LoginModal input cannot get focused
      controls.enabled = false;
      controls.update();
      scene.add(camera);

      const importworld = new THREE.TextureLoader().load(world);
      const newWorld = new THREE.MeshBasicMaterial({
        map: importworld,
        color: this.props.globeColor,
      });

      const mesh = new THREE.Mesh(sphere, newWorld);

      globe.add(mesh);
      globe.add(allPoints);
      globe.add(allArcs);
      scene.add(globe);

      // Set up Three stuff we want access to
      this.allArcs = allArcs;
      this.allPoints = allPoints;
      this.scene = scene;
      this.camera = camera;
      this.renderer = renderer;
      this.globe = globe;
      this.controls = controls;

      // Add pin for user
      this.addSelfPoint();
      this.pointRegister();

      const context = this.renderer.getContext();

      context.canvas.addEventListener(
        'webglcontextlost',
        this.contextLostHandler,
        false
      );

      context.canvas.addEventListener(
        'webglcontextrestored',
        this.contextRestoredHandler,
        false
      );

      context.canvas.addEventListener(
        'mouseout',
        () => {
          this.controls.enabled = false;
        },
        false
      );

      context.canvas.addEventListener(
        'mouseover',
        () => {
          this.controls.enabled = true;
        },
        false
      );
      this.threeRootElement.appendChild(renderer.domElement);
      window.addEventListener('resize', this.onWindowResize, false);
      this.start();
    } catch (e) {
      console.log(e);
    }
  }
  /**
   * Handle Webgl Context Restore Event
   *
   * @memberof Globe
   */
  contextRestoredHandler() {
    console.error('CONTEXT RESTORED');
    this.start();
    console.error('RESTORED GLOBE');
  }

  /**
   * Handle Webgl Context Lost Event
   *
   * @param {*} event
   * @memberof Globe
   */
  contextLostHandler(event) {
    event.preventDefault();
    console.error('CONTEXT LOST!!');
    this.stop();
  }

  /**
   * Update event from React
   *
   * @param {*} prevProps
   * @memberof Globe
   */
  componentDidUpdate(prevProps) {
    if (geoip == null) {
      return;
    }

    console.log('$$$$$$$$');
    console.log(prevProps);
    this.timesSkipped++;
    if (
      this.props.connections !== prevProps.connections ||
      this.timesSkipped > 15 ||
      this.props.blocks !== prevProps.blocks
    ) {
      this.pointRegister();
      this.timesSkipped = 0;
      this.animateArcs();
    }
  }

  /**
   * Unmount event from React
   *
   * @memberof Globe
   */
  componentWillUnmount() {
    this.stop();
    window.removeEventListener('resize', this.onWindowResize, false);
    this.controls.dispose();
    if (this.threeRootElement.children.length > 0) {
      this.threeRootElement.removeChild(this.renderer.domElement);
    }
  }

  /**
   * Register point/pillar on the globe
   *
   * @returns
   * @memberof Globe
   */
  async pointRegister() {
    const peerInfo = await apiPost('system/list/peers', null);
    if (!peerInfo) return;
    if (peerInfo.length > MaxDisplayPoints) {
      peerInfo.length = MaxDisplayPoints;
    }

    console.error(peerInfo);

    // take the peerInfo look up the Geo Data in the maxmind DB
    // and if there are any points that exist and match coords
    // update the registery entry data

    let newRegistry = peerInfo
      .map(peer => {
        let GeoData = geoip.get(peer.address.split(':')[0]);
        // TODO: add checks for lisp and change color appropreately
        console.log(this.props.pillarColor);
        return {
          lat: GeoData.location.latitude,
          lng: GeoData.location.longitude,
          params: {
            type: peer.type,
            outgoing: peer.outgoing,
            name: GeoData.location.time_zone,
            color: peer.outgoing ? '#C0fCCf' : this.props.pillarColor,
            ddddd: 1,
          },
        };
      })
      .map((peer, i, array) => {
        let existIndex = this.pointRegistry.findIndex(
          point => peer.lat === point.lat && peer.lng === point.lng
        );
        let duplicateIndex = array.findIndex(
          internalPoint =>
            peer.lat === internalPoint.lat && peer.lng === internalPoint.lng
        );

        // if not an internal duplicate and already exists
        if (existIndex >= 0 && duplicateIndex === i) {
          console.error(this.pointRegistry[existIndex]);
          let asdad = this.pointRegistry[existIndex];
          asdad.params = { ...asdad.params, ddddd: 1 };
          console.log(asdad);
          return asdad;
        } else if (duplicateIndex === i) {
          let newPoint = new Point(peer.lat, peer.lng, {
            ...peer.params,
            ddddd: peer.params.ddddd + 3,
          });
          // console.log(this.allPoints);
          console.log('duplicate');
          //if (this.allPoints.children.length <= 10) {
          this.allPoints.add(newPoint.pillar);
          //}
          return newPoint;
        }
      })
      .filter(e => e);
    console.error(newRegistry);
    this.pointRegistry.map(point => {
      let existIndex = newRegistry.findIndex(
        peer => peer.lat === point.lat && peer.lng === point.lng
      );

      if (existIndex < 0 && point.params.type !== 'SELF') {
        this.destroyPoint(point);
      }
    });

    this.pointRegistry = newRegistry;
    this.arcRegister();
  }

  /**
   * Add globe to the renderer
   *
   * @memberof Globe
   */
  addSelfPoint() {
    let selfIndex = this.pointRegistry.indexOf(
      point => point.params.type === 'SELF'
    );

    if (selfIndex < 0) {
      fetch('http://www.geoplugin.net/json.gp')
        .then(response => response.json())
        .then(data => {
          let self = new Point(
            parseFloat(data.geoplugin_latitude),
            parseFloat(data.geoplugin_longitude),
            {
              color: '#44EB08',
              name: data.geoplugin_timezone,
              type: 'SELF',
              ddddd: 1.5,
            }
          );
          this.pointRegistry.push(self);
          this.allPoints.add(self.pillar);
          this.arcRegister();
        })
        .catch(e => console.log(e));
    }
  }

  /**
   * Remove all points on the globe
   *
   * @memberof Globe
   */
  removeAllPoints() {
    this.pointRegistry.map(point => {
      if (point.params.type === 'SELF') {
        setTimeout(() => {
          this.destroyPoint(point);
        }, 11000);
      } else {
        setTimeout(() => {
          this.destroyPoint(point);
        }, Math.random() * 10000);
      }
    });
  }

  /**
   * Remove point/pillar from the globe
   *
   * @param {*} deadPoint Point to remove
   * @memberof Globe
   */
  destroyPoint(deadPoint) {
    this.pointRegistry = this.pointRegistry.filter(point => {
      if (point.pillar.uuid !== deadPoint.pillar.uuid) return point;
    });

    this.allPoints.remove(deadPoint.pillar);
    this.curveRegistry
      .filter(arc => {
        if (
          (arc.pointOne.lat === deadPoint.lat &&
            arc.pointOne.lat === deadPoint.lat) ||
          (arc.pointTwo.lat === deadPoint.lat &&
            arc.pointTwo.lat === deadPoint.lat)
        )
          return arc;
      })
      .map(arc => {
        this.destroyArc(arc);
      });

    deadPoint.pillar.geometry.dispose();
    deadPoint.pillar.material.dispose();
    deadPoint.pillar = undefined;
  }

  /**
   * Register a arc with the globe
   *
   * @memberof Globe
   */
  arcRegister() {
    let self = this.pointRegistry[
      this.pointRegistry.findIndex(element => {
        return element.params.type === 'SELF';
      })
    ];

    if (self) {
      this.pointRegistry.forEach(point => {
        let existIndex = this.curveRegistry.findIndex(curve => {
          if (
            curve.pointOne.lat === point.lat &&
            curve.pointOne.lng === point.lng &&
            curve.pointTwo.lat === self.lat &&
            curve.pointTwo.lng === self.lng
          ) {
            return curve;
          } else return false;
        });

        if (
          (point.lat === self.lat && point.lng === self.lng) ||
          existIndex >= 0
        ) {
          return;
        } else {
          let temp = new Curve(point, self, {
            color: this.props.archColor,
            forward: false,
          });
          this.allArcs.add(temp.arc);
          //temp.play();
          this.curveRegistry.push(temp);
        }
      });
    } else {
      this.addSelfPoint();
    }
  }

  /**
   * Animate all the Curves on the globe
   *
   * @memberof Globe
   */
  animateArcs() {
    console.log(this.curveRegistry);
    this.curveRegistry.map(arc => {
      console.error(arc);
      arc.play();
    });
  }

  /**
   * Removes the unused Curve
   *
   * @param {*} deadCurve Curve to remove
   * @memberof Globe
   */
  destroyArc(deadCurve) {
    this.curveRegistry = this.curveRegistry.filter(curve => {
      if (curve.arc.uuid !== deadCurve.arc.uuid) return curve;
    });

    this.allArcs.remove(deadCurve.arc);
    deadCurve.arc.geometry.dispose();
    deadCurve.arc.material.dispose();
    deadCurve.arc = undefined;
  }

  /**
   * Event when the window resizes
   *
   * @memberof Globe
   */
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Stop the animation
   *
   * @memberof Globe
   */
  stop() {
    cancelAnimationFrame(this.frameId);
  }

  /**
   * Start the animation
   *
   * @memberof Globe
   */
  start() {
    this.animateArcs();
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  }

  /**
   * Animate the globe
   *
   * @memberof Globe
   */
  animate() {
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  }

  /**
   * Renders the screen to the THREE's canvas
   *
   * @memberof Globe
   */
  renderScene() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Component's Renderable JSX
   *
   * @returns {JSX} JSX
   * @memberof Globe
   */
  render() {
    return (
      <GlobeContainer>
        <div ref={element => (this.threeRootElement = element)} />
      </GlobeContainer>
    );
  }
}
