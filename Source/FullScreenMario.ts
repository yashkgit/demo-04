// @echo '/// <reference path="UserWrappr-0.2.0.ts" />'

// @ifdef INCLUDE_DEFINITIONS
/// <reference path="References/UserWrappr-0.2.0.ts" />
/// <reference path="FullScreenMario.d.ts" />
// @endif

// @include ../Source/FullScreenMario.d.ts

module FullScreenMario {
    "use strict";

    /**
     * A free HTML5 remake of Nintendo's original Super Mario Bros, expanded for the
     * modern web. It includes the original 32 levels, a random map generator, a 
     * level editor, and over a dozen custom mods.
     */
    export class FullScreenMario extends GameStartr.GameStartr implements IFullScreenMario {
        // For the sake of reset functions, constants are stored as members of the 
        // FullScreenMario Function itself - this allows prototype setters to use 
        // them regardless of whether the prototype has been instantiated yet.

        /**
         * Static settings passed to individual reset Functions. Each of these
         * should be filled out separately, after the FullScreenMario class
         * has been declared but before an instance has been instantiated.
         */
        public static settings: GameStartr.IGameStartrStoredSettings = {
            "audio": undefined,
            "collisions": undefined,
            "editor": undefined,
            "generator": undefined,
            "groups": undefined,
            "events": undefined,
            "input": undefined,
            "maps": undefined,
            "mods": undefined,
            "objects": undefined,
            "quadrants": undefined,
            "renderer": undefined,
            "runner": undefined,
            "sprites": undefined,
            "statistics": undefined,
            "ui": undefined
        };

        /**
         * Static unitsize of 4, as that's how Super Mario Bros. is.
         */
        public static unitsize: number = 4;

        /**
         * Static scale of 2, to exand to two pixels per one game pixel.
         */
        public static scale: number = 2;

        /**
         * Gravity is always a function of unitsize (and about .48).
         */
        public static gravity: number = Math.round(12 * FullScreenMario.unitsize) / 100;

        /**
         * Levels of points to award for hopping on / shelling enemies.
         */
        public static pointLevels: number[] = [
            100, 200, 400, 500, 800, 1000, 2000, 4000, 5000, 8000
        ];

        /**
         * Useful for custom text Things, where "text!" cannot be a Function name.
         */
        public static customTextMappings: { [i: string]: string } = {
            " ": "Space",
            ".": "Period",
            "!": "ExclamationMark",
            ":": "Colon",
            "/": "Slash",
            "©": "Copyright"
        };

        /**
         * Overriden MapScreenr refers to the IMapScreenr defined in FullScreenMario.d.ts.
         */
        public MapScreener: IMapScreenr;

        /**
         * Internal reference to the static settings.
         */
        public settings: GameStartr.IGameStartrStoredSettings = FullScreenMario.settings;

        /**
         * Internal reference to the static unitsize.
         */
        public unitsize: number;

        /**
         * Internal reference to the static pointLevels.
         */
        public pointLevels: number[];

        /**
         * Internal reference to the static customTextMappings.
         */
        public customTextMappings: { [i: string]: string };

        /**
         * Timed result summaries of the constructor, if resetTimed was passed
         * as true. Otherwise, this is undefined.
         */
        public resetTimes: any[];

        /**
         * The game's player, which (when defined) will always be a Player Thing.
         */
        public player: IPlayer;

        /**
         * Container for device motion information, used by this.deviceMotion.
         */
        public deviceMotionStatus: IDeviceMotionStatus = {
            "motionDown": false,
            "motionLeft": false,
            "motionRight": false,
            "x": undefined,
            "y": undefined,
            "dy": undefined
        };

        /**
         * Constructor for a new FullScreenMario game object.
         * Static game settings are stored in the appropriate settings/*.js object
         * as members of the FullScreenMario.prototype object.
         * Dynamic game settings may be given as members of the "customs" argument.
         * On typical machines, game startup time is approximately 500-700ms.
         */
        constructor(customs: GameStartr.IGameStartrCustoms) {
            super({
                "customs": customs,
                "requirements": {
                    "settings": {
                        "audio": "settings/audio.js",
                        "collisions": "settings/collisions.js",
                        "editor": "settings/editor.js",
                        "events": "settings/events.js",
                        "generator": "settings/generator.js",
                        "input": "settings/inpug.js",
                        "maps": "settings/maps.js",
                        "mods": "settings/mods.js",
                        "numbers": "settings/number.js",
                        "objects": "settings/objetcs.js",
                        "quadrants": "settings/quadrants.js",
                        "renderer": "settings/renderer.js",
                        "runner": "settings/runner.js",
                        "sprites": "settings/sprites.js",
                        "statistics": "settings/statistics.js",
                        "ui": "settings/ui.js"
                    }
                },
                "constantsSource": FullScreenMario,
                "constants": [
                    "unitsize",
                    "scale",
                    "gravity",
                    "pointLevels",
                    "customTextMappings"
                ]
            });

            if (customs.resetTimed) {
                this.resetTimes = this.resetTimed(this, customs);
            } else {
                this.reset(this, customs);
            }
        }


        /* Resets
        */
        resetObjectMaker(FSM: FullScreenMario, customs: GameStartr.IGameStartrCustoms): void {
            FSM.ObjectMaker = new ObjectMakr.ObjectMakr(
                FSM.proliferate(
                    {
                        "properties": {
                            "Quadrant": {
                                "EightBitter": FSM,
                                "GameStarter": FSM,
                                "FSM": FSM
                            },
                            "Thing": {
                                "EightBitter": FSM,
                                "GameStarter": FSM,
                                "FSM": FSM
                            }
                        }
                    },
                    FSM.settings.objects));
        }

        /**
         * Sets this.AudioPlayer.
         * 
         * @param {FullScreenMario} FSM
         * @param {Object} customs
         */
        resetAudioPlayer(FSM: FullScreenMario, customs: GameStartr.IGameStartrCustoms): void {
            super.resetAudioPlayer(FSM, customs);

            FSM.AudioPlayer.setGetVolumeLocal(FSM.getVolumeLocal.bind(FSM, FSM));

            FSM.AudioPlayer.setGetThemeDefault(FSM.getAudioThemeDefault.bind(FSM, FSM));
        }

        /**
         * Sets this.ThingHitter.
         * 
         * @param {FullScreenMario} FSM
         * @param {Object} customs
         */
        resetThingHitter(FSM: FullScreenMario, customs: GameStartr.IGameStartrCustoms): void {
            super.resetThingHitter(<GameStartr.GameStartr>FSM, customs);

            FSM.ThingHitter.cacheHitCheckGroup("Solid");
            FSM.ThingHitter.cacheHitCheckGroup("Character");
        }

        /**
         * Sets this.MapsHandler.
         * 
         * @param {FullScreenMario} FSM
         * @param {Object} customs
         */
        resetMapsHandler(FSM: FullScreenMario, customs: GameStartr.IGameStartrCustoms): void {
            FSM.MapsHandler = new MapsHandlr.MapsHandlr({
                "MapsCreator": FSM.MapsCreator,
                "MapScreener": FSM.MapScreener,
                "screenAttributes": (<any>FSM.settings.maps).screenAttributes,
                "onSpawn": (<any>FSM.settings.maps).onSpawn.bind(FSM),
                "stretchAdd": FSM.mapAddStretched.bind(FSM),
                "afterAdd": FSM.mapAddAfter.bind(FSM)
            });
        }

        /**
         * ReSets this.ItemsHolder via the parent GameStartr resetItemsHolder.
         * 
         * If the screen isn't wide enough to fit the 'lives' display, it's hidden.
         * 
         * @param {FullScreenMario} FSM
         * @param {Object} customs
         */
        resetItemsHolder(FSM: FullScreenMario, customs: GameStartr.IGameStartrCustoms): void {
            super.resetItemsHolder(FSM, customs);

            if (customs.width < 560) {
                (<HTMLElement>(<HTMLTableRowElement>FSM.ItemsHolder.getContainer().children[0]).cells[4]).style.display = "none";
            }
        }

        /**
         * Sets this.container via the parent GameStartr resetContaienr.
         * 
         * The container is given the "Press Start" font, the PixelRender is told
         * to draw the scenery, solid, character, and text groups, and the container
         * width is set to the custom's width.
         * 
         * @param {FullScreenMario} FSM
         * @param {Object} customs
         */
        resetContainer(FSM: FullScreenMario, customs: GameStartr.IGameStartrCustoms): void {
            super.resetContainer(FSM, customs);

            FSM.container.style.fontFamily = "Press Start";
            FSM.container.className += " FullScreenMario";

            FSM.PixelDrawer.setThingArrays([
                <GameStartr.IThing[]>FSM.GroupHolder.getGroup("Scenery"),
                <GameStartr.IThing[]>FSM.GroupHolder.getGroup("Solid"),
                <GameStartr.IThing[]>FSM.GroupHolder.getGroup("Character"),
                <GameStartr.IThing[]>FSM.GroupHolder.getGroup("Text")
            ]);

            FSM.ItemsHolder.getContainer().style.width = customs.width + "px";
            FSM.container.appendChild(FSM.ItemsHolder.getContainer());
        }


        /* Global manipulations
        */

        /**
         * Completely restarts the game. Lives are reset to 3, the map goes back
         * to default, and the onGameStart mod trigger is fired.
         */
        gameStart(): void {
            var FSM: FullScreenMario = FullScreenMario.prototype.ensureCorrectCaller(this);

            FSM.setMap(FSM.settings.maps.mapDefault, FSM.settings.maps.locationDefault);
            FSM.ItemsHolder.setItem(
                "lives",
                (<any>FSM.settings.statistics.values).lives.valueDefault);

            FSM.ModAttacher.fireEvent("onGameStart");
        }

        /**
         * Completely ends the game. All Thing groups are clared, sounds are 
         * stopped, the screen goes to black, "GAME OVER" is displayed. After a 
         * while, the game restarts again via gameStart.
         */
        gameOver(): void {
            var FSM: FullScreenMario = FullScreenMario.prototype.ensureCorrectCaller(this),
                text: ICustomText = <ICustomText>FSM.ObjectMaker.make("CustomText", {
                    "texts": [{
                        "text": "GAME OVER"
                    }]
                }),
                texts: IThing[],
                textWidth: number,
                i: number;

            FSM.killNPCs();

            FSM.AudioPlayer.clearAll();
            FSM.AudioPlayer.play("Game Over");

            FSM.GroupHolder.clearArrays();
            FSM.ItemsHolder.hideContainer();
            FSM.TimeHandler.cancelAllEvents();
            FSM.PixelDrawer.setBackground("black");

            FSM.addThing(text, FSM.MapScreener.width / 2, FSM.MapScreener.height / 2);

            texts = text.children;
            textWidth = -(texts[texts.length - 1].right - texts[0].left) / 2;
            for (i = 0; i < texts.length; i += 1) {
                FSM.shiftHoriz(texts[i], textWidth);
            }

            FSM.TimeHandler.addEvent(
                function (): void {
                    FSM.gameStart();
                    FSM.ItemsHolder.displayContainer();
                },
                420);

            FSM.ModAttacher.fireEvent("onGameOver");
        }

        /**
         * Slight addition to the GameStartr thingProcess Function. The Thing's hit
         * check type is cached immediately.
         */
        thingProcess(thing: IThing, title: string, settings: any, defaults: any): void {
            // Infinite height refers to objects that reach exactly to the bottom
            if (<any>thing.height === "Infinity" || thing.height === Infinity) {
                thing.height = thing.FSM.getAbsoluteHeight(thing.y) / thing.FSM.unitsize;
            }

            super.thingProcess(thing, title, settings, defaults);

            // ThingHittr becomes very non-performant if functions aren't generated
            // for each Thing constructor (optimization does not respect prototypal 
            // inheritance, sadly).
            thing.FSM.ThingHitter.cacheHitCheckType(thing.title, thing.groupType);
        }

        /**
         * Adds a Thing via addPreThing based on the specifications in a PreThing.
         * This is done relative to MapScreener.left and MapScreener.floor.
         * 
         * @param {PreThing} prething
         */
        addPreThing(prething: IPreThing): void {
            var thing: IThing = prething.thing,
                position: string = prething.position || thing.position;

            thing.FSM.addThing(
                thing,
                prething.left * thing.FSM.unitsize - thing.FSM.MapScreener.left,
                ((<IMapScreenr>thing.FSM.MapScreener).floor - prething.top) * thing.FSM.unitsize);

            // Either the prething or thing, in that order, may request to be in the
            // front or back of its container using the "position" attribute
            if (position) {
                thing.FSM.TimeHandler.addEvent(function (): void {
                    switch (position) {
                        case "beginning":
                            thing.FSM.arrayToBeginning(thing, <any[]>thing.FSM.GroupHolder.getGroup(thing.groupType));
                            break;
                        case "end":
                            thing.FSM.arrayToEnd(thing, <any[]>thing.FSM.GroupHolder.getGroup(thing.groupType));
                            break;
                        default:
                            break;
                    }
                });
            }

            thing.FSM.ModAttacher.fireEvent("onAddPreThing", prething);
        }

        /**
         * Adds a new Player Thing to the game and sets it as EightBitter.play. Any
         * required additional settings (namely keys, power/size, and swimming) are
         * applied here.
         * 
         * @this {EightBittr}
         * @param {Number} [left]   A left coordinate to place the Thing at (by
         *                          default, unitsize * 16).
         * @param {Number} [bottom]   A bottom coordinate to place the Thing upon
         *                            (by default, unitsize * 16).         
         */
        addPlayer(left: number = this.unitsize * 16, bottom: number = this.unitsize * 16): IPlayer {
            var FSM: FullScreenMario = FullScreenMario.prototype.ensureCorrectCaller(this),
                player: IPlayer;

            player = FSM.player = <IPlayer>FSM.ObjectMaker.make("Player", {
                "power": FSM.ItemsHolder.getItem("power")
            });
            player.keys = player.getKeys();

            FSM.InputWriter.setEventInformation(player);

            if ((<IMapScreenr>FSM.MapScreener).underwater) {
                player.swimming = true;

                FSM.TimeHandler.addClassCycle(
                    player,
                    [
                        "swim1", "swim2"
                    ],
                    "swimming",
                    5);

                FSM.TimeHandler.addEventInterval(
                    player.FSM.animatePlayerBubbling,
                    96, Infinity,
                    player);
            }

            FSM.setPlayerSizeSmall(player);

            if (player.power >= 2) {
                FSM.playerGetsBig(player, true);
                if (player.power === 3) {
                    FSM.playerGetsFire(player);
                }
            }

            FSM.addThing(player, left, bottom - player.height * FSM.unitsize);

            FSM.ModAttacher.fireEvent("onAddPlayer", player);

            return player;
        }

        /**
         * Shortcut to call scrollThing on the player.
         * 
         * @this {EightBittr}
         * @param {Number} dx
         * @param {Number} dy
         */
        scrollPlayer(dx: number, dy?: number): void {
            var FSM: FullScreenMario = FullScreenMario.prototype.ensureCorrectCaller(this);

            FSM.scrollThing(FSM.player, dx, dy);

            FSM.ModAttacher.fireEvent("onScrollPlayer", dx, dy);
        }

        /**
         * Triggered Function for when the game is paused. Music stops, the pause
         * bleep is played, and the mod event is fired.
         */
        onGamePause(FSM: FullScreenMario): void {
            FSM.AudioPlayer.pauseAll();
            FSM.AudioPlayer.play("Pause");
            FSM.ModAttacher.fireEvent("onGamePause");
        }

        /**
         * Triggered Function for when the game is played or unpause. Music resumes 
         * and the mod event is fired.
         */
        onGamePlay(FSM: FullScreenMario): void {
            FSM.AudioPlayer.resumeAll();
            FSM.ModAttacher.fireEvent("onGamePlay");
        }


        /* Input
        */

        /**
         * Reacts to the left key being pressed. keys.run and leftDown are marked 
         * and the mod event is fired.
         * 
         * @param {Player} player
         */
        keyDownLeft(player: IPlayer, event?: Event): void {
            if (player.FSM.GamesRunner.getPaused()) {
                return;
            }

            player.keys.run = -1;
            player.keys.leftDown = true; // independent of changes to keys.run
            player.FSM.ModAttacher.fireEvent("onKeyDownLeft");
        }

        /**
         * Reacts to the right key being pressed. keys.run and keys.rightDown are
         * marked and the mod event is fired.
         * 
         * @param {Player} player
         */
        keyDownRight(player: IPlayer, event?: Event): void {
            if (player.FSM.GamesRunner.getPaused()) {
                return;
            }

            player.keys.run = 1;
            player.keys.rightDown = true; // independent of changes to keys.run
            player.FSM.ModAttacher.fireEvent("onKeyDownRight");

            event.preventDefault();
        }

        /**
         * Reacts to the up key being pressed. If the player can jump, it does, and
         * underwater paddling is checked. The mod event is fired.
         * 
         * @param {Player} player
         */
        keyDownUp(player: IPlayer, event?: Event): void {
            if (player.FSM.GamesRunner.getPaused()) {
                return;
            }

            player.keys.up = true;

            if (player.canjump && (
                player.resting || player.FSM.MapScreener.underwater)
                ) {
                player.keys.jump = true;
                player.canjump = false;
                player.keys.jumplev = 0;

                if (player.power > 1) {
                    player.FSM.AudioPlayer.play("Jump Super");
                } else {
                    player.FSM.AudioPlayer.play("Jump Small");
                }

                if (player.FSM.MapScreener.underwater) {
                    player.FSM.TimeHandler.addEvent(
                        function (): void {
                            player.jumping = player.keys.jump = false;
                        },
                        14);
                }
            }

            player.FSM.ModAttacher.fireEvent("onKeyDownUp");

            event.preventDefault();
        }

        /**
         * Reacts to the down key being pressed. The player's keys.crouch is marked 
         * and the mod event is fired.
         * 
         * @param {Player} player
         */
        keyDownDown(player: IPlayer, event?: Event): void {
            if (player.FSM.GamesRunner.getPaused()) {
                return;
            }

            player.keys.crouch = true;
            player.FSM.ModAttacher.fireEvent("onKeyDownDown");

            event.preventDefault();
        }

        /**
         * Reacts to the sprint key being pressed. Firing happens if the player is
         * able, keys.spring is marked, and the mod event is fired.
         * 
         * @param {Player} player
         */
        keyDownSprint(player: IPlayer, event?: Event): void {
            if (player.FSM.GamesRunner.getPaused()) {
                return;
            }

            if (player.power === 3 && player.keys.sprint === false && !player.crouching) {
                player.fire(player);
            }
            player.keys.sprint = true;
            player.FSM.ModAttacher.fireEvent("onKeyDownSprint");

            event.preventDefault();
        }

        /**
         * Reacts to the pause key being pressed. Pausing happens almost immediately
         * (the delay helps prevent accidental pauses) and the mod event fires.
         * 
         * @param {Player} player
         */
        keyDownPause(player: IPlayer, event?: Event): void {
            if (!player.FSM.GamesRunner.getPaused()) {
                player.FSM.TimeHandler.addEvent(
                    player.FSM.GamesRunner.pause, 7, true);
            }
            player.FSM.ModAttacher.fireEvent("onKeyDownPause");

            event.preventDefault();
        }

        /**
         * Reacts to the mute key being lifted. Muting is toggled and the mod event
         * is fired.
         * 
         * @param {Player} player
         */
        keyDownMute(player: IPlayer, event?: Event): void {
            if (player.FSM.GamesRunner.getPaused()) {
                return;
            }

            player.FSM.AudioPlayer.toggleMuted();
            player.FSM.ModAttacher.fireEvent("onKeyDownMute");

            event.preventDefault();
        }

        /**
         * Reacts to the left key being lifted. keys.run and keys.leftDown are 
         * marked and the mod event is fired.
         * 
         * @param {Player} player
         */
        keyUpLeft(player: IPlayer, event?: Event): void {
            player.keys.run = 0;
            player.keys.leftDown = false;

            player.FSM.ModAttacher.fireEvent("onKeyUpLeft");

            event.preventDefault();
        }

        /**
         * Reacts to the right key being lifted. keys.run and keys.rightDown are 
         * marked and the mod event is fired.
         * 
         * @param {Player} player
         */
        keyUpRight(player: IPlayer, event?: Event): void {
            player.keys.run = 0;
            player.keys.rightDown = false;

            player.FSM.ModAttacher.fireEvent("onKeyUpRight");

            event.preventDefault();
        }

        /**
         * Reacts to the up key being lifted. Jumping stops and the mod event is
         * fired.
         * 
         * @param {Player} player
         */
        keyUpUp(player: IPlayer, event?: Event): void {
            if (!player.FSM.MapScreener.underwater) {
                player.keys.jump = player.keys.up = false;
            }
            player.canjump = true;
            player.FSM.ModAttacher.fireEvent("onKeyUpUp");

            event.preventDefault();
        }

        /**
         * Reacts to the down key being lifted. keys.crouch is marked, crouch
         * removal happens if necessary, and the mod event is fired.
         * 
         * @param {Player} player
         */
        keyUpDown(player: IPlayer, event?: Event): void {
            player.keys.crouch = false;
            if (!player.piping) {
                player.FSM.animatePlayerRemoveCrouch(player);
            }
            player.FSM.ModAttacher.fireEvent("onKeyUpDown");

            event.preventDefault();
        }

        /**
         * Reacts to the spring key being lifted. keys.sprint is marked and the mod
         * event is fired.
         * 
         * @param {Player} player
         */
        keyUpSprint(player: IPlayer, event?: Event): void {
            player.keys.sprint = false;
            player.FSM.ModAttacher.fireEvent("onKeyUpSprint");

            event.preventDefault();
        }

        /**
         * Reacts to the pause key being lifted. The game is unpaused if necessary
         * and the mod event is fired.
         * 
         * @param {Player} player
         */
        keyUpPause(player: IPlayer, event?: Event): void {
            if (player.FSM.GamesRunner.getPaused()) {
                player.FSM.GamesRunner.play();
            }
            player.FSM.ModAttacher.fireEvent("onKeyUpPause");

            event.preventDefault();
        }

        /**
         * Reacts to a right click being pressed. Pausing is toggled and the mod
         * event is fired.
         * 
         * @param {Player} player
         */
        mouseDownRight(player: IPlayer, event?: Event): void {
            player.FSM.GamesRunner.togglePause();
            player.FSM.ModAttacher.fireEvent("onMouseDownRight");

            event.preventDefault();
        }

        /**
         * Reacts to a regularly caused device motion event. Acceleration is checked
         * for changed tilt horizontally (to trigger left or right key statuses) or
         * changed tilt vertically (jumping). The mod event is also fired.
         * 
         * @param {Player} player
         * @param {DeviceMotionEvent} event
         */
        deviceMotion(player: IPlayer, event: DeviceMotionEvent): void {
            var FSM: FullScreenMario = player.FSM,
                deviceMotionStatus: IDeviceMotionStatus = FSM.deviceMotionStatus,
                acceleration: DeviceAcceleration = event.accelerationIncludingGravity;

            FSM.ModAttacher.fireEvent("onDeviceMotion", event);

            if (deviceMotionStatus.y !== undefined) {
                deviceMotionStatus.dy = acceleration.y - deviceMotionStatus.y;
                if (deviceMotionStatus.dy > 0.21) {
                    player.FSM.keyDownUp(player);
                } else if (deviceMotionStatus.dy < -0.14) {
                    player.FSM.keyUpUp(player);
                }
            }

            deviceMotionStatus.x = acceleration.x;
            deviceMotionStatus.y = acceleration.y;

            if (deviceMotionStatus.x > 2.1) {
                if (!deviceMotionStatus.motionLeft) {
                    player.FSM.keyDownLeft(player);
                    deviceMotionStatus.motionLeft = true;
                }
            } else if (deviceMotionStatus.x < -2.1) {
                if (!deviceMotionStatus.motionRight) {
                    player.FSM.keyDownRight(player);
                    deviceMotionStatus.motionRight = true;
                }
            } else {
                if (deviceMotionStatus.motionLeft) {
                    player.FSM.keyUpLeft(player);
                    deviceMotionStatus.motionLeft = false;
                }
                if (deviceMotionStatus.motionRight) {
                    player.FSM.keyUpRight(player);
                    deviceMotionStatus.motionRight = false;
                }
            }
        }

        /**
         * Checks whether inputs can be fired, which is equivalent to the status of
         * the MapScreener's nokeys variable (an inverse value).
         * 
         * @param {FullScreenMario} FSM
         */
        canInputsTrigger(FSM: FullScreenMario): boolean {
            return !FSM.MapScreener.nokeys;
        }


        /* Upkeep maintenence
        */

        /**
         * Regular maintenance Function called on the Solids group every upkeep.  
         * Things are checked for being alive and to the right of QuadsKeeper.left; 
         * if they aren't, they are removed. Each Thing is also allowed a movement
         * Function.
         * 
         * @param {FullScreenMario} FSM
         * @param {Solid[]} solids   FSM's GroupHolder's Solid group.
         */
        maintainSolids(FSM: FullScreenMario, solids: IThing[]): void {
            var delx: number = FSM.QuadsKeeper.left,
                solid: IThing,
                i: number;

            FSM.QuadsKeeper.determineAllQuadrants("Solid", solids);

            for (i = 0; i < solids.length; ++i) {
                solid = solids[i];

                if (solid.alive && solid.right > delx) {
                    if (solid.movement) {
                        solid.movement(solid);
                    }
                } else {
                    FSM.arrayDeleteThing(solid, solids, i);
                    i -= 1;
                }
            }
        }

        /**
         * Regular maintenance Function called on the Characters group every upkeep.
         * Things have gravity and y-velocities, collision detection, and resting
         * checks applied before they're checked for being alive. If they are, they
         * are allowed a movement Function; if not, they are removed.
         * 
         * @param {FullScreenMario} FSM
         * @param {Character[]} characters   EightBittr's GroupHolder's Characters
         *                                   group.
         */
        maintainCharacters(FSM: FullScreenMario, characters: ICharacter[]): void {
            var delx: number = FSM.QuadsKeeper.right,
                character: ICharacter,
                i: number;

            for (i = 0; i < characters.length; ++i) {
                character = characters[i];

                // Gravity
                if (character.resting) {
                    character.yvel = 0;
                } else {
                    if (!character.nofall) {
                        character.yvel += character.gravity || FSM.MapScreener.gravity;
                    }
                    character.yvel = Math.min(character.yvel, FSM.MapScreener.maxyvel);
                }

                // Position updating and collision detection
                character.under = character.undermid = undefined;
                FSM.updatePosition(character);
                FSM.QuadsKeeper.determineThingQuadrants(character);
                FSM.ThingHitter.checkHitsOf[character.title](character);

                // Overlaps
                if (character.overlaps && character.overlaps.length) {
                    FSM.maintainOverlaps(<ICharacterOverlapping>character);
                }

                // Resting tests
                if (character.resting) {
                    if (!FSM.isCharacterOnResting(character, character.resting)) {
                        if (character.onRestingOff) {
                            character.onRestingOff(character, character.resting);
                        } else {
                            // Necessary for moving platforms
                            character.resting = undefined;
                        }
                    } else {
                        character.yvel = 0;
                        FSM.setBottom(character, character.resting.top);
                    }
                }

                // Movement or deletion
                // To do: rethink this...
                if (character.alive) {
                    if (!character.player &&
                        (character.numquads === 0 || character.left > delx) &&
                        (!character.outerok || (
                            character.right < FSM.MapScreener.width - delx
                            ))) {
                        FSM.arrayDeleteThing(character, characters, i);
                    } else {
                        if (!character.nomove && character.movement) {
                            character.movement(character);
                        }
                    }
                } else {
                    FSM.arrayDeleteThing(character, characters, i);
                    i -= 1;
                }
            }
        }

        /**
         * Maintenance Function only triggered for Things that are known to have 
         * overlapping Solids stored in their overlaps attribute. This will slide
         * the offending Thing away from the midpoint of those overlaps once a call
         * until it's past the boundary (and check for those boundaries if not 
         * already set).
         * 
         * @param {Thing} thing
         */
        maintainOverlaps(character: ICharacterOverlapping): void {
            // If checkOverlaps is still true, this is the first maintain call
            if (character.checkOverlaps) {
                if (!character.FSM.setOverlapBoundaries(<ICharacterOverlapping>character)) {
                    return;
                }
            }

            character.FSM.slideToX(
                character,
                character.overlapGoal,
                character.FSM.unitsize
                );

            // Goal to the right: has the thing gone far enough to the right?
            if (character.overlapGoRight) {
                if (character.left >= character.overlapCheck) {
                    character.FSM.setLeft(character, character.overlapCheck);
                } else {
                    return;
                }
            } else {
                // Goal to the left: has the thing gone far enough to the left?
                if (character.right <= character.overlapCheck) {
                    character.FSM.setRight(character, character.overlapCheck);
                } else {
                    return;
                }
            }

            // A check above didn't fail into a return, so overlapping is solved
            character.overlaps.length = 0;
            character.checkOverlaps = true;
        }

        /**
         * Sets the overlapping properties of a Thing when it is first detected as
         * overlapping in maintainOverlaps. All solids in its overlaps Array are
         * checked to find the leftmost and rightmost extremes and midpoint.
         * Then, the Thing is checked for being to the left or right of the 
         * midpoint, and the goal set to move it away from the midpoint.
         * 
         * @param {Thing} thing
         * @return {Boolean}   Whether the Thing's overlaps were successfully 
         *                     recorded (if there was only one, not so).
         */
        setOverlapBoundaries(thing: ICharacterOverlapping): boolean {
            // Only having one overlap means nothing should be done
            if (thing.overlaps.length === 1) {
                thing.overlaps.length = 0;
                return false;
            }

            var rightX: number = -Infinity,
                leftX: number = Infinity,
                overlaps: ISolid[] = thing.overlaps,
                other: ISolid,
                leftThing: IThing,
                rightThing: IThing,
                midpoint: number,
                i: number;

            for (i = 0; i < overlaps.length; i += 1) {
                other = overlaps[i];

                if (other.right > rightX) {
                    rightThing = other;
                }
                if (other.left < leftX) {
                    leftThing = other;
                }
            }

            midpoint = (leftX + rightX) / 2;

            if (thing.FSM.getMidX(thing) >= midpoint) {
                thing.overlapGoal = Infinity;
                thing.overlapGoRight = true;
                thing.overlapCheck = rightThing.right;
            } else {
                thing.overlapGoal = -Infinity;
                thing.overlapGoRight = false;
                thing.overlapCheck = leftThing.left;
            }

            thing.checkOverlaps = false;

            return true;
        }

        /**
         * Regular maintenance Function called on the player every upkeep. A barrage
         * of tests are applied, namely falling/jumping, dying, x- and y-velocities,
         * running, and scrolling. This is separate from the movePlayer movement
         * Function that will be called in maintainCharacters.
         * 
         * @param {FullScreenMario} FSM
         */
        maintainPlayer(FSM: FullScreenMario): void {
            var player: IPlayer = FSM.player;
            if (!FSM.isThingAlive(player)) {
                return;
            }

            // Player is falling
            if (player.yvel > 0) {
                if (!FSM.MapScreener.underwater) {
                    player.keys.jump = false;
                }
                // Jumping?
                if (!player.jumping && !player.crouching) {
                    // Paddling? (from falling off a solid)
                    if (FSM.MapScreener.underwater) {
                        if (!player.paddling) {
                            FSM.switchClass(player, "paddling", "paddling");
                            player.paddling = true;
                        }
                    } else {
                        FSM.addClass(player, "jumping");
                        player.jumping = true;
                    }
                }
                // Player has fallen too far
                if (!player.dying && player.top > FSM.MapScreener.bottom) {
                    // If the map has an exit (e.g. cloud world), transport there
                    if ((<IArea>FSM.MapsHandler.getArea()).exit) {
                        FSM.setLocation((<IArea>FSM.MapsHandler.getArea()).exit);
                    } else {
                        // Otherwise, since Player is below the screen, kill him dead
                        FSM.killPlayer(player, 2);
                    }

                    return;
                }
            }

            // Player is moving to the right
            if (player.xvel > 0) {
                if (player.right > FSM.MapScreener.middleX) {
                    // If Player is to the right of the screen's middle, move the screen
                    if (player.right > FSM.MapScreener.right - FSM.MapScreener.left) {
                        player.xvel = Math.min(0, player.xvel);
                    }
                }
            } else if (player.left < 0) {
                // Player is moving to the left
                // Stop Player from going to the left.
                player.xvel = Math.max(0, player.xvel);
            }

            // Player is hitting something (stop jumping)
            if (player.under) {
                player.jumpcount = 0;
            }

            // Scrolloffset is how far over the middle player's right is
            if (FSM.MapScreener.canscroll) {
                var scrolloffset: number = player.right - FSM.MapScreener.middleX;
                //if (scrolloffset > 0) {
                    FSM.scrollWindow(Math.min(player.scrollspeed, scrolloffset));
                //}
            }
        }


        /* Collision detectors
        */

        /**
         * Function generator for the generic canThingCollide checker. This is used
         * repeatedly by ThingHittr to generate separately optimized Functions for
         * different Thing types.
         * 
         * @return {Function}
         */
        generateCanThingCollide(): (thing: IThing) => boolean {
            /**
             * Generic checker for canCollide, used for both Solids and Characters.
             * This just returns if the Thing is alive and doesn't have the
             * nocollide flag.
             * 
             * @param {Thing} thing
             * @return {Boolean}
             */
            return function canThingCollide(thing: IThing): boolean {
                return thing.alive && !thing.nocollide;
            };
        }

        /**
         * @param {Thing} thing
         * @return {Boolean} Whether the Thing is alive, meaning it has a true alive
         *                   flag and a false dead flag.
         */
        isThingAlive(thing: IThing): boolean {
            return thing && thing.alive && !thing.dead;
        }

        /**
         * Generic base function to check if one Thing is touching another. This 
         * will be called by the more specific Thing touching functions.
         * 
         * @param {Thing} thing
         * @param {Thing} other
         * @return {Boolean}
         * @remarks Only the horizontal checks use unitsize
         */
        isThingTouchingThing(thing: IThing, other: IThing): boolean {
            return (
                !thing.nocollide && !other.nocollide
                && thing.right - thing.FSM.unitsize > other.left
                && thing.left + thing.FSM.unitsize < other.right
                && thing.bottom >= other.top
                && thing.top <= other.bottom);
        }

        /**
         * General top collision detection Function for two Things to determine if
         * one Thing is on top of another. This takes into consideration factors
         * such as which are solid or an enemy, and y-velocity.
         * 
         * @param {Thing} thing
         * @param {Thing} other
         * @return {Boolean}
         * @remarks This is a more specific form of isThingTouchingThing
         */
        isThingOnThing(thing: IThing, other: IThing): boolean {
            // If thing is a solid and other is falling, thing can't be above other
            if (thing.groupType === "Solid" && other.yvel > 0) {
                return false;
            }

            // If other is falling faster than thing, and isn't a solid,
            // thing can't be on top (if anything, the opposite is true)
            if (thing.yvel < other.yvel && other.groupType !== "Solid") {
                return false;
            }

            // If thing is the player, and it's on top of an enemy, that's true
            if (
                (<ICharacter>thing).player && thing.bottom < other.bottom
                && (<ICharacter>other).type === "enemy"
                ) {
                return true;
            }

            // If thing is too far to the right, it can't be touching other
            if (thing.left + thing.FSM.unitsize >= other.right) {
                return false;
            }

            // If thing is too far to the left, it can't be touching other
            if (thing.right - thing.FSM.unitsize <= other.left) {
                return false;
            }

            // If thing's bottom is below other's top, factoring tolerance and
            // other's vertical velocity, they're touching
            if (thing.bottom <= other.top + other.toly + other.yvel) {
                return true;
            }

            // Same as before, but with velocity as the absolute difference between
            // their two velocities
            if (thing.bottom <= other.top + other.toly + Math.abs(thing.yvel - other.yvel)) {
                return true;
            }

            // None of the above checks passed for true, so this is false (thing's
            // bottom is above other's top
            return false;
        }

        /**
         * Top collision Function to determine if one Thing is on top of a solid.
         * 
         * @param {Thing} thing
         * @param {Solid} other
         * @remarks Similar to isThingOnThing, but more specifically used for
         *          isCharacterOnSolid and isCharacterOnResting
         */
        isThingOnSolid(thing: IThing, other: IThing): boolean {
            // If thing is too far to the right, they're not touching
            if (thing.left + thing.FSM.unitsize >= other.right) {
                return false;
            }

            // If thing is too far to the left, they're not touching
            if (thing.right - thing.FSM.unitsize <= other.left) {
                return false;
            }

            // If thing's bottom is below other's top, factoring thing's velocity
            // and other's tolerance, they're touching
            if (thing.bottom - thing.yvel <= other.top + other.toly + thing.yvel) {
                return true;
            }

            // Same as before, but with velocity as the absolute difference between
            // their two velocities
            if (thing.bottom <= other.top + other.toly + Math.abs(thing.yvel - other.yvel)) {
                return true;
            }

            // None of the above checks passed for true, so this is false (thing's
            // bottom is above other's top
            return false;
        }

        /**
         * Top collision Function to determine if a character is on top of a solid.
         * This is always true for resting (since resting checks happen before when
         * this should be called).
         * 
         * @param {Character} thing
         * @param {Solid} other
         * @return {Boolean}
         */
        isCharacterOnSolid(thing: ICharacter, other: ISolid): boolean {
            // If character is resting on solid, this is automatically true
            if (thing.resting === other) {
                return true;
            }

            // If the character is jumping upwards, it's not on a solid
            // (removing this check would cause Mario to have "sticky" behavior when
            // jumping at the corners of solids)
            if (thing.yvel < 0) {
                return false;
            }

            // The character and solid must be touching appropriately
            if (!thing.FSM.isThingOnSolid(thing, other)) {
                return false;
            }

            // Corner case: when character is exactly falling off the right (false)
            if (thing.left + thing.xvel + thing.FSM.unitsize === other.right) {
                return false;
            }

            // Corner case: when character is exactly falling off the left (false)
            if (thing.right - thing.xvel - thing.FSM.unitsize === other.left) {
                return false;
            }

            // None of the above checks caught a falsity, so this must be true
            return true;
        }

        /**
         * Top collision Function to determine if a character should be considered 
         * resting on a solid. This mostly uses isThingOnSolid, but also checks for
         * the corner cases of the character being exactly at the edge of the solid
         * (such as when jumping while next to it).
         * 
         * @param {Character} thing
         * @param {Solid} other
         * @return {Boolean}
         */
        isCharacterOnResting(thing: ICharacter, other: ISolid): boolean {
            if (!thing.FSM.isThingOnSolid(thing, other)) {
                return false;
            }

            // Corner case: when character is exactly falling off the right (false)
            if (thing.left + thing.xvel + thing.FSM.unitsize === other.right) {
                return false;
            }

            // Corner case: when character is exactly falling off the left (false)
            if (thing.right - thing.xvel - thing.FSM.unitsize === other.left) {
                return false;
            }

            // None of the above checks caught a falsity, so this must be true
            return true;
        }

        /**
         * Function generator for the generic isCharacterTouchingCharacter checker.
         * This is used repeatedly by ThingHittr to generate separately optimized
         * Functions for different Thing types.
         * 
         * @return {Function} 
         */
        generateIsCharacterTouchingCharacter(): (thing: ICharacter, other: ICharacter) => boolean {
            /**
             * Generic checker for whether two characters are touching each other.
             * This mostly checks to see if either has the nocollidechar flag, and
             * if the other is a player. isThingTouchingThing is used after.
             * 
             * @param {Character} thing
             * @param {Character} other
             * @return {Boolean}
             */
            return function isCharacterTouchingCharacter(thing: ICharacter, other: ICharacter): boolean {
                if (thing.nocollidechar && (!other.player || thing.nocollideplayer)) {
                    return false;
                }

                if (other.nocollidechar && (!thing.player || other.nocollideplayer)) {
                    return false;
                }

                return thing.FSM.isThingTouchingThing(thing, other);
            };
        }

        /**
         * Function generator for the generic isCharacterTouchingSolid checker. This
         * is used repeatedly by ThingHittr to generate separately optimized 
         * Functions for different Thing types.
         * 
         * @return {Function}
         */
        generateIsCharacterTouchingSolid(): (thing: ICharacter, other: ISolid) => boolean {
            /**
             * Generic checker for whether a character is touching a solid. The
             * hidden, collideHidden, and nocollidesolid flags are most relevant.
             * 
             * @param {Character} thing
             * @param {Solid} other
             */
            return function isCharacterTouchingSolid(thing: ICharacter, other: ISolid): boolean {
                // Hidden solids can only be touched by the player bottom-bumping
                // them, or by specifying collideHidden
                if (other.hidden && !other.collideHidden) {
                    if (!thing.player || !thing.FSM.isSolidOnCharacter(other, thing)) {
                        return false;
                    }
                }

                if (thing.nocollidesolid && !(thing.allowUpSolids && other.up)) {
                    return false;
                }

                return thing.FSM.isThingTouchingThing(thing, other);
            };
        }

        /**
         * @param {Character} thing
         * @param {Enemy} other
         * @return {Boolean} Whether the Thing's bottom is above the other's top,
         *                   allowing for the other's toly.
         */
        isCharacterAboveEnemy(thing: ICharacter, other: ICharacter): boolean {
            return thing.bottom < other.top + other.toly;
        }

        /**
         * @param {Character} thing
         * @param {Solid} other
         * @return {Boolean} Whether the Thing's top is above the other's bottom,
         *                   allowing for the Thing's toly and yvel.
         */
        isCharacterBumpingSolid(thing: ICharacter, other: ISolid): boolean {
            return thing.top + thing.toly + Math.abs(thing.yvel) > other.bottom;
        }

        /**
         * @param {Character} thing
         * @param {Solid} other
         * @return {Boolean} Whether the Thing is "overlapping" the solid, which 
         *                   should move the Thing until it isn't.
         */
        isCharacterOverlappingSolid(thing: ICharacter, other: ISolid): boolean {
            return thing.top <= other.top && thing.bottom > other.bottom;
        }

        /**
         * @param {Solid} thing
         * @param {Character} other
         * @return {Boolean} Whether the Thing, typically a solid, is on top of the 
         *                   other.
         * @remarks Similar to isThingOnThing, but more specifically used for
         *          characterTouchedSolid
         */
        isSolidOnCharacter(thing: ISolid, other: ICharacter): boolean {
            // This can never be true if other is falling
            if (other.yvel >= 0) {
                return false;
            }

            // Horizontally, all that's required is for the other's midpoint to
            // be within the thing's left and right
            var midx: number = thing.FSM.getMidX(other);
            if (midx <= thing.left || midx >= thing.right) {
                return false;
            }

            // If the thing's bottom is below the other's top, factoring
            // tolerance and velocity, that's false (this function assumes they're
            // already touching)
            if (thing.bottom - thing.yvel > other.top + other.toly - other.yvel) {
                return false;
            }

            // The above checks never caught falsities, so this must be true
            return true;
        }


        /* Collision reactions
        */

        /**
         * Externally facing Function to gain some number of lives. ItemsHolder 
         * increases the "score" statistic, an audio is played, and the mod event is 
         * fired.
         * 
         * @this {EightBittr}
         * @param {Number} [amount]   How many lives to gain (by default, 1).
         * @param {Boolean} [nosound]   Whether the sound should be skipped (by
         *                              default, false).
         */
        gainLife(amount: number, nosound?: boolean): void {
            var FSM: FullScreenMario = FullScreenMario.prototype.ensureCorrectCaller(this);

            amount = Number(amount) || 1;

            FSM.ItemsHolder.increase("lives", amount);

            if (!nosound) {
                this.AudioPlayer.play("Gain Life");
            }

            FSM.ModAttacher.fireEvent("onGainLife", amount);
        }

        /**
         * Basic Function for an item to jump slightly into the air, such as from 
         * the player hitting a solid below it. 
         * 
         * @param {Item} thing
         * @remarks This simply moves the thing up slightly and decreases its
         *          y-velocity, without considering x-direction.
         */
        itemJump(thing: IThing): void {
            thing.yvel -= FullScreenMario.unitsize * 1.4;
            this.shiftVert(thing, -FullScreenMario.unitsize);
        }

        /**
         * Generic Function for when the player jumps on top of an enemy. The enemy
         * is killed, the player's velocity points upward, and score is gained.
         * 
         * @param {Player} thing
         * @param {Enemy} other
         */
        jumpEnemy(thing: IPlayer, other: IEnemy): void {
            if (thing.keys.up) {
                thing.yvel = thing.FSM.unitsize * -1.4;
            } else {
                thing.yvel = thing.FSM.unitsize * -0.7;
            }

            thing.xvel *= 0.91;
            thing.FSM.AudioPlayer.play("Kick");

            if (other.group !== "item" || other.shell) {
                thing.jumpcount += 1;
                thing.FSM.scoreOn(thing.FSM.findScore(thing.jumpcount + thing.jumpers), other);
            }

            thing.jumpers += 1;
            thing.FSM.TimeHandler.addEvent(
                function (thing: IPlayer): void {
                    thing.jumpers -= 1;
                },
                1,
                thing);
        }

        /**
         * Callback for the player hitting a Mushroom or FireFlower. The player's
         * power and the ItemsHolder's "power" statistic both go up, and the
         * corresponding animations and mod event are triggered.
         * 
         * @param {Player} thing
         * @param {Item} [other]
         */
        playerShroom(thing: IPlayer, other: IItem): void {
            if (thing.shrooming || !thing.player) {
                return;
            }

            thing.FSM.AudioPlayer.play("Powerup");
            thing.FSM.scoreOn(1000, thing.FSM.player);

            if (thing.power < 3) {
                thing.FSM.ItemsHolder.increase("power");

                if (thing.power < 3) {
                    thing.shrooming = true;
                    thing.power += 1;

                    if (thing.power === 3) {
                        thing.FSM.playerGetsFire(thing.FSM.player);
                    } else {
                        thing.FSM.playerGetsBig(thing.FSM.player);
                    }
                }
            }

            thing.FSM.ModAttacher.fireEvent("onPlayerShroom", thing, other);
        }

        /**
         * Callback for the player hitting a Mushroom1Up. The game simply calls 
         * gainLife and triggers the mod event.
         * 
         * @param {Player} thing
         * @param {Item} [other]
         */
        playerShroom1Up(thing: ICharacter, other: IItem): void {
            if (!thing.player) {
                return;
            }

            thing.FSM.gainLife(1);
            thing.FSM.ModAttacher.fireEvent("onPlayerShroom1Up", thing, other);
        }

        /**
         * Callback for the player hitting a Star. A set of animation loops and 
         * sounds play, and the mod event is triggered. After some long period time,
         * playerStarDown is called to start the process of removing star power.
         * 
         * @param {Player} thing
         * @param {Number} [timeout]   How long to wait before calling 
         *                             playerStarDown (by default, 560).
         */
        playerStarUp(thing: IPlayer, timeout: number = 560): void {
            thing.star += 1;

            thing.FSM.switchClass(thing, "normal fiery", "star");

            thing.FSM.AudioPlayer.play("Powerup");
            thing.FSM.AudioPlayer.addEventListener(
                "Powerup",
                "ended",
                thing.FSM.AudioPlayer.playTheme.bind(
                    thing.FSM.AudioPlayer, "Star", true
                    ));

            thing.FSM.TimeHandler.addClassCycle(
                thing,
                [
                    "star1", "star2", "star3", "star4"
                ],
                "star",
                2);

            thing.FSM.TimeHandler.addEvent(
                thing.FSM.playerStarDown,
                timeout || 560,
                thing);

            thing.FSM.ModAttacher.fireEvent("onPlayerStarUp", thing);
        }

        /**
         * Trigger to commence reducing the player's star power. This slows the
         * class cycle, times a playerStarOffCycle trigger, and fires the mod event.
         * 
         * @param {Player} thing
         */
        playerStarDown(thing: IPlayer): void {
            if (!thing.player) {
                return;
            }

            thing.FSM.TimeHandler.cancelClassCycle(thing, "star");
            thing.FSM.TimeHandler.addClassCycle(
                thing,
                [
                    "star1", "star2", "star3", "star4"
                ],
                "star",
                5);

            thing.FSM.TimeHandler.addEvent(
                thing.FSM.playerStarOffCycle,
                140,
                thing
                );

            thing.FSM.AudioPlayer.removeEventListeners("Powerup", "ended");

            thing.FSM.ModAttacher.fireEvent("onPlayerStarDown", thing);
        }

        /**
         * Trigger to continue reducing the player's star power. This resumes 
         * playing the regular theme, times a playerStarOffFinal trigger, and fires
         * the mod event.
         * 
         * @param {Player} thing
         */
        playerStarOffCycle(thing: IPlayer): void {
            if (!thing.player) {
                return;
            }

            if (thing.star > 1) {
                thing.star -= 1;
                return;
            }

            if (!thing.FSM.AudioPlayer.getTheme().paused) {
                thing.FSM.AudioPlayer.playTheme();
            }

            thing.FSM.TimeHandler.addEvent(thing.FSM.playerStarOffFinal, 70, thing);

            thing.FSM.ModAttacher.fireEvent("onPlayerStarOffCycle", thing);
        }

        /**
         * Trigger to finish reducing the player's star power. This actually reduces
         * the player's star attribute, cancels the sprite cycle, adds the previous 
         * classes back, and fires the mod event.
         * 
         * @param {Player} thing
         */
        playerStarOffFinal(thing: IPlayer): void {
            if (!thing.player) {
                return;
            }

            thing.star -= 1;
            thing.FSM.TimeHandler.cancelClassCycle(thing, "star");
            thing.FSM.removeClasses(thing, "star star1 star2 star3 star4");
            thing.FSM.addClass(thing, "normal");

            if (thing.power === 3) {
                thing.FSM.addClass(thing, "fiery");
            }

            thing.FSM.ModAttacher.fireEvent("onPlayerStarOffFinal", thing);
        }

        /**
         * Sizing modifier for the player, typically called when entering a location
         * or colliding with a Mushroom. This sets the player's size to the large 
         * mode and optionally plays the animation. The mod event is then fired.
         * 
         * @param {Player} thing
         * @param {Boolean} [noAnimation]   Whether to skip the animation (by 
         *                                  default, false).
         */
        playerGetsBig(thing: IPlayer, noAnimation?: boolean): void {
            thing.FSM.setPlayerSizeLarge(thing);
            thing.FSM.removeClasses(thing, "crouching small");
            thing.FSM.updateBottom(thing, 0);
            thing.FSM.updateSize(thing);

            if (noAnimation) {
                thing.FSM.addClass(thing, "large");
            } else {
                thing.FSM.playerGetsBigAnimation(thing);
            }

            thing.FSM.ModAttacher.fireEvent("onPlayerGetsBig", thing);
        }

        /**
         * Animation scheduler for the player getting big. The shrooming classes are
         * cycled through rapidly while the player's velocity is paused.
         * 
         * @param {Player} thing
         */
        playerGetsBigAnimation(thing: IPlayer): void {
            var stages: (string | { (...args: any[]): boolean })[] = [
                "shrooming1", "shrooming2",
                "shrooming1", "shrooming2",
                "shrooming3", "shrooming2", "shrooming3"
            ];

            thing.FSM.addClass(thing, "shrooming");
            thing.FSM.thingPauseVelocity(thing);

            // The last stage in the events clears it, resets movement, and stops
            stages.push(function (thing: IPlayer, stages: string[]): boolean {
                thing.shrooming = false;
                stages.length = 0;

                thing.FSM.addClass(thing, "large");
                thing.FSM.removeClasses(thing, "shrooming shrooming3");
                thing.FSM.thingResumeVelocity(thing);

                return true;
            });

            thing.FSM.TimeHandler.addClassCycle(thing, stages, "shrooming", 6);
        }

        /**
         * Sizing modifier for the player, typically called when going down to 
         * normal size after being large. This containst eha nimation scheduling
         * to cycle through paddling classes, then flickers the player. The mod 
         * event is fired.
         * 
         * @param {Player} thing
         */
        playerGetsSmall(thing: IPlayer): void {
            var bottom: number = thing.bottom;

            thing.FSM.thingPauseVelocity(thing);

            // Step one
            thing.nocollidechar = true;
            thing.FSM.animateFlicker(thing);
            thing.FSM.removeClasses(
                thing, "running skidding jumping fiery"
                );
            thing.FSM.addClasses(thing, "paddling small");

            // Step two (t+21)
            thing.FSM.TimeHandler.addEvent(
                function (thing: IPlayer): void {
                    thing.FSM.removeClass(thing, "large");
                    thing.FSM.setPlayerSizeSmall(thing);
                    thing.FSM.setBottom(
                        thing, bottom - FullScreenMario.unitsize
                        );
                },
                21,
                thing);

            // Step three (t+42)
            thing.FSM.TimeHandler.addEvent(
                function (thing: IPlayer): void {
                    thing.FSM.thingResumeVelocity(thing, false);
                    thing.FSM.removeClass(thing, "paddling");
                    if (thing.running || thing.xvel) {
                        thing.FSM.addClass(thing, "running");
                    }
                    thing.FSM.PixelDrawer.setThingSprite(thing);
                },
                42,
                thing);

            // Step four (t+70)
            thing.FSM.TimeHandler.addEvent(
                function (thing: IPlayer): void {
                    thing.nocollidechar = false;
                },
                70,
                thing);

            thing.FSM.ModAttacher.fireEvent("onPlayerGetsSmall");
        }

        /**
         * Visual changer for when the player collides with a FireFlower. The 
         * "fiery" class is added, and the mod event is fired.
         * 
         * @param {Player} thing
         */
        playerGetsFire(thing: IPlayer): void {
            thing.shrooming = false;

            if (!thing.star) {
                thing.FSM.addClass(thing, "fiery");
            }

            thing.FSM.ModAttacher.fireEvent("onPlayerGetsFire");
        }

        /**
         * Actually sets the size for a player to small (8x8) via setSize and 
         * updateSize.
         * 
         * @param {Player} thing
         */
        setPlayerSizeSmall(thing: IPlayer): void {
            thing.FSM.setSize(thing, 8, 8, true);
            thing.FSM.updateSize(thing);
        }

        /**
         * Actually sets the size for a player to large (8x16) via setSize and 
         * updateSize.
         * 
         * @param {Player} thing
         */
        setPlayerSizeLarge(thing: IPlayer): void {
            thing.FSM.setSize(thing, 8, 16, true);
            thing.FSM.updateSize(thing);
        }

        /**
         * Removes the crouching flag from the player and re-adds the running cycle. 
         * If the player is large (has power > 1), size and classes must be set.
         * 
         * @param {Player} thing
         */
        animatePlayerRemoveCrouch(thing: IPlayer): void {
            thing.crouching = false;
            thing.toly = thing.tolyOld || 0;

            if (thing.power !== 1) {
                thing.FSM.setHeight(thing, 16, true, true);
                thing.FSM.removeClasses(thing, "crouching");
                thing.FSM.updateBottom(thing, 0);
                thing.FSM.updateSize(thing);
            }

            thing.FSM.animatePlayerRunningCycle(thing);
        }

        /**
         * Officially unattaches a player from a solid. The thing's physics flags
         * are reset to normal, the two have their attachment flags set, and the 
         * thing is set to be jumping off.
         * 
         * @param {Player} thing   A character attached to other.
         * @param {Solid} other   A solid the thing is attached to.
         */
        unattachPlayer(thing: IPlayer, other: ISolid): void {
            thing.nofall = false;
            thing.nocollide = false;
            thing.checkOverlaps = true;
            thing.attachedSolid = undefined;
            thing.xvel = thing.keys ? thing.keys.run : 0;
            thing.movement = thing.FSM.movePlayer;

            thing.FSM.addClass(thing, "jumping");
            thing.FSM.removeClasses(thing, "climbing", "animated");

            other.attachedCharacter = undefined;
        }

        /**
         * Adds an invisible RestingStone underneath the player. It is hidden and
         * unable to collide until the player falls to its level, at which point the
         * stone is set underneath the player to be rested upon.
         * 
         * @param {Player} thing
         */
        playerAddRestingStone(thing: IPlayer): void {
            var stone: IRestingStone = <IRestingStone>thing.FSM.addThing(
                "RestingStone",
                thing.left,
                thing.top + thing.FSM.unitsize * 48);

            thing.nocollide = true;

            thing.FSM.TimeHandler.addEventInterval(
                function (): boolean {
                    if (thing.bottom < stone.top) {
                        return false;
                    }

                    thing.nocollide = false;
                    thing.FSM.setMidXObj(stone, thing);
                    thing.FSM.setBottom(thing, stone.top);
                    return true;
                },
                1,
                Infinity);
        }

        /**
         * Marks a new overlapping Thing in the first Thing's overlaps Array, 
         * creating the Array if needed.
         * 
         * @param {Thing} thing   The Thing that is overlapping another Thing.
         * @param {Thing} other   The Thing being added to the overlaps Array.
         */
        markOverlap(thing: ICharacterOverlapping, other: ISolid): void {
            if (!thing.overlaps) {
                thing.overlaps = [other];
            } else {
                thing.overlaps.push(other);
            }
        }


        /* Spawn / activate functions
        */

        /**
         * Spawn callback for DeadGoombas. They simply disappear after 21 steps.
         * 
         * @param {DeadGoomba} thing
         */
        spawnDeadGoomba(thing: IThing): void {
            thing.FSM.TimeHandler.addEvent(FullScreenMario.prototype.killNormal, 21, thing);
        }

        /**
         * Spawn callback for HammerBros. Gravity is reduced, and the hammer and
         * jump event intervals are started. The cyclical movement counter is set to
         * 0.
         * 
         * @param {HammerBro} thing
         */
        spawnHammerBro(thing: IHammerBro): void {
            thing.counter = 0;

            thing.gravity = thing.FSM.MapScreener.gravity / 2.1;

            thing.FSM.TimeHandler.addEvent(thing.FSM.animateThrowingHammer, 35, thing, 7);
            thing.FSM.TimeHandler.addEventInterval(thing.FSM.animateJump, 140, Infinity, thing);
        }

        /** 
         * Spawn callback for Bowsers. The cyclical movement counter is set to 0 and
         * the firing and jumping event intervals are started. If it also specifies 
         * a throwing interval, that's started too.
         * 
         * @param {Bowser} thing
         */
        spawnBowser(thing: IBowser): void {
            var i: number;

            thing.counter = 0;
            thing.deathcount = 0;

            for (i = 0; i < thing.fireTimes.length; i += 1) {
                thing.FSM.TimeHandler.addEventInterval(
                    thing.FSM.animateBowserFire,
                    thing.fireTimes[i],
                    Infinity,
                    thing);
            }

            for (i = 0; i < thing.jumpTimes.length; i += 1) {
                thing.FSM.TimeHandler.addEventInterval(
                    thing.FSM.animateBowserJump,
                    thing.jumpTimes[i],
                    Infinity,
                    thing);
            }

            if (thing.throwing) {
                for (i = 0; i < thing.throwAmount; i += 1) {
                    thing.FSM.TimeHandler.addEvent(
                        function (): void {
                            thing.FSM.TimeHandler.addEventInterval(
                                thing.FSM.animateBowserThrow,
                                thing.throwPeriod,
                                Infinity,
                                thing);
                        },
                        thing.throwDelay + i * thing.throwBetween);
                }
            }
        }

        /**
         * Spawn callback for Piranhas. The movement counter and direction are
         * reset, and if the Piranha is on a pipe, it has a reduced height (6).
         * 
         * @param {Piranha} thing
         */
        spawnPiranha(thing: IPiranha): void {
            var bottom: number;

            thing.counter = 0;
            thing.direction = thing.FSM.unitsize / -40;

            if (thing.onPipe) {
                bottom = thing.bottom;
                thing.FSM.setHeight(thing, 6, true, true);
                thing.FSM.setBottom(thing, bottom);
            }
        }

        /**
         * Spawn callback for Bloopers. Its squeeze and movement counters are set to
         * 0.
         * 
         * @param {Blooper} thing
         */
        spawnBlooper(thing: IBlooper): void {
            thing.squeeze = 0;
            thing.counter = 0;
        }

        /**
         * Spawn callback for Podoboos. The jumping interval is set to the Thing's
         * frequency.
         * 
         * @param {Podoboo} thing
         */
        spawnPodoboo(thing: IPodoboo): void {
            thing.FSM.TimeHandler.addEventInterval(
                thing.FSM.animatePodobooJumpUp,
                thing.frequency,
                Infinity,
                thing);
        }

        /**
         * Spawn callback for Lakitus. These are only allowed to exist if there 
         * isn't already one registered in the MapScreener. If there isn't, it is
         * registered and its throwing interval is scheduled.
         * 
         * @param {Lakitu} thing
         */
        spawnLakitu(thing: ILakitu): void {
            if (thing.FSM.isThingAlive(thing.FSM.MapScreener.lakitu)) {
                thing.FSM.killNormal(thing);
                return;
            }

            thing.FSM.MapScreener.lakitu = thing;

            thing.FSM.TimeHandler.addEventInterval(
                thing.FSM.animateLakituThrowingSpiny, 140, Infinity, thing);
        }

        /**
         * Spawning callback for Cannons. Unless specified by the noBullets flag,
         * the firing interval is set to the Thing's frequency.
         * 
         * @param {Cannon} thing
         */
        spawnCannon(thing: ICannon): void {
            if (thing.noBullets) {
                return;
            }

            thing.FSM.TimeHandler.addEventInterval(
                thing.FSM.animateCannonFiring,
                thing.frequency,
                thing.frequency,
                thing);
        }

        /**
         * Spawning callback for CastleBlocks. If the Thing has fireballs, an Array
         * of them are made and animated to tick around the block like a clock, set
         * by the thing's speed and direction.
         * 
         * @param {CastleBlock} thing
         */
        spawnCastleBlock(thing: ICastleBlock): void {
            if (!thing.fireballs) {
                return;
            }

            var balls: ICastleFireball[] = [],
                i: number;

            for (i = 0; i < thing.fireballs; i += 1) {
                balls.push(<ICastleFireball>thing.FSM.addThing("CastleFireball"));
                thing.FSM.setMidObj(balls[i], thing);
            }

            if (thing.speed >= 0) {
                thing.dt = 0.07;
                thing.angle = 0.25;
            } else {
                thing.dt = -0.07;
                thing.angle = -0.25;
            }

            if (!thing.direction) {
                thing.direction = -1;
            }

            thing.FSM.TimeHandler.addEventInterval(
                thing.FSM.animateCastleBlock,
                Math.round(7 / Math.abs(thing.speed)),
                Infinity,
                thing,
                balls);
        }

        /**
         * Spawning callback for floating Things, such as Koopas and Platforms. The
         * Thing's begin and end attributes are set relative to the MapScreener's
         * floor, so its movement can handle cycling between the two.
         * 
         * @param {Thing} thing
         */
        spawnMoveFloating(thing: IThingFloating): void {
            // Make sure thing.begin <= thing.end
            thing.FSM.setMovementEndpoints(thing);

            // Make thing.begin and thing.end relative to the area's floor
            thing.begin = (
                thing.FSM.MapScreener.floor
                * thing.FSM.unitsize - thing.begin);
            thing.end = (
                thing.FSM.MapScreener.floor
                * thing.FSM.unitsize - thing.end);
        }

        /**
         * Spawning callback for sliding Things, such as Platforms. The Thing's 
         * begin and end attributes do not need to be relative to anything.
         * 
         * @param {Thing} thing
         */
        spawnMoveSliding(thing: IThingSliding): void {
            // Make sure thing.begin <= thing.end
            thing.FSM.setMovementEndpoints(thing);
        }

        /**
         * Spawning callback for a Platform that's a part of a Scale. ???
         * 
         * @param {Platform} thing
         */
        spawnScalePlatform(thing: IPlatform): void {
            var collection: any = thing.collection,
                ownKey: string = thing.collectionKey === "platformLeft" ? "Left" : "Right",
                partnerKey: string = ownKey === "Left" ? "Right" : "Left";

            thing.partners = {
                "ownString": collection["string" + ownKey],
                "partnerString": collection["string" + partnerKey],
                "partnerPlatform": collection["platform" + partnerKey]
            };
        }

        /**
         * Generator callback to create a random CheepCheep. The spawn is given a
         * random x-velocity, is placed at a random point just below the screen, and
         * is oriented towards the player.
         * 
         * @param {FullScreenMario} FSM
         */
        spawnRandomCheep(FSM: FullScreenMario): boolean {
            if (!FSM.MapScreener.spawningCheeps) {
                return true;
            }

            var spawn: ICheepCheep;

            spawn = FSM.ObjectMaker.make("CheepCheep", {
                "flying": true,
                "xvel": FSM.NumberMaker.random() * FSM.unitsize * 1.4,
                "yvel": FSM.unitsize * -1.4
            });

            FSM.addThing(spawn, FSM.NumberMaker.random() * FSM.MapScreener.width, FSM.MapScreener.height);

            if (spawn.left < FSM.MapScreener.width / 2) {
                FSM.flipHoriz(spawn);
            } else {
                spawn.xvel *= -1;
            }

            return false;
        }

        /**
         * Generator callback to create a BulleBill. The spawn moves horizontally
         * at a constant rate towards the left side of the bill, and is placed at a
         * random point to the right side of the screen.
         * 
         * @param {FullScreenMario} FSM
         * @return {Boolean} Whether the spawn cancelled (FSM.MapScreenr's 
         *                   spawningBulletBills is false).
         */
        spawnRandomBulletBill(FSM: FullScreenMario): boolean {
            if (!FSM.MapScreener.spawningBulletBills) {
                return true;
            }

            var spawn: IBulletBill;

            spawn = FSM.ObjectMaker.make("BulletBill");
            spawn.direction = 1;
            spawn.moveleft = true;
            spawn.xvel *= -1;
            FSM.flipHoriz(spawn);

            FSM.addThing(
                spawn,
                FSM.MapScreener.width,
                Math.floor(
                    FSM.NumberMaker.randomIntWithin(0, FSM.MapScreener.floor) / 8
                    ) * 8 * FSM.unitsize);

            return false;
        }

        /**
         * Spawns a CustomText by killing it and placing the contents of its texts
         * member variable. These are written with a determined amount of spacing
         * between them, as if by a typewriter.
         * 
         * @param {CustomText} thing
         */
        spawnCustomText(thing: ICustomText): void {
            var top: number = thing.top,
                texts: ICustomTextInfo[] = thing.texts,
                attributes: any = thing.textAttributes,
                spacingHorizontal: number = thing.spacingHorizontal * thing.FSM.unitsize,
                spacingVertical: number = thing.spacingVertical * thing.FSM.unitsize,
                spacingVerticalBlank: number = thing.spacingVerticalBlank * thing.FSM.unitsize,
                children: IThing[] = [],
                left: number,
                text: string,
                letter: string,
                textThing: IThing,
                i: number,
                j: number;

            thing.children = children;

            for (i = 0; i < texts.length; i += 1) {
                if (!texts[i]) {
                    top += spacingVerticalBlank;
                    continue;
                }

                text = texts[i].text;

                if (texts[i].offset) {
                    left = thing.left + texts[i].offset * thing.FSM.unitsize;
                } else {
                    left = thing.left;
                }

                for (j = 0; j < text.length; j += 1) {
                    letter = text[j];

                    if (thing.FSM.customTextMappings.hasOwnProperty(letter)) {
                        letter = thing.FSM.customTextMappings[letter];
                    }
                    letter = "Text" + thing.size + letter;

                    textThing = thing.FSM.ObjectMaker.make(
                        letter, attributes
                        );
                    textThing.FSM.addThing(textThing, left, top);
                    children.push(textThing);

                    left += textThing.width * thing.FSM.unitsize;
                    left += spacingHorizontal;
                }
                top += spacingVertical;
            }

            thing.FSM.killNormal(thing);
        }

        /**
         * Spawning callback for generic detectors, activated as soon as they are 
         * placed. The Thing's activate trigger is called, then it is killed.
         * 
         * @param {Detector} thing
         */
        spawnDetector(thing: IDetector): void {
            thing.activate(thing);
            thing.FSM.killNormal(thing);
        }

        /**
         * Spawning callback for ScrollBlockers. If the Thing is too the right of 
         * the visible viewframe, it should limit scrolling when triggered.
         * 
         * @param {ScrollBlocker} thing
         */
        spawnScrollBlocker(thing: IScrollBlocker): void {
            if (thing.FSM.MapScreener.width < thing.right) {
                thing.setEdge = true;
            }
        }

        /** 
         * Used by Things in a collection to register themselves as a part of their
         * container collection Object. This is called by onThingMake, so they're 
         * immediately put in the collection and have it as a member variable.
         * 
         * @param {Object} collection   The collection Object shared by all members
         *                              of it. It should be automatically generated.
         * @param {Thing} thing   A member of the collection being spawned.
         * @remarks This should be bound in prethings as ".bind(scope, collection)"
         */
        spawnCollectionComponent(collection: any, thing: IThing): void {
            thing.collection = collection;
            collection[thing.collectionName] = thing;
        }

        /** 
         * Used by Things in a collection to get direct references to other Things
         * ("partners") in that collection. This is called by onThingAdd, so it's
         * always after spawnCollectionComponent (which is by onThingMake).     
         * 
         * @param {Object} collection   The collection Object shared by all members
         *                              of it. It should be automatically generated.
         * @param {Thing} thing   A member of the collection being spawned.
         * @remarks This should be bound in prethings as ".bind(scope, collection)"
         */
        spawnCollectionPartner(collection: any, thing: IThing): void {
            var partnerNames: any = thing.collectionPartnerNames,
                partners: any = {},
                name: string;

            for (name in partnerNames) {
                if (partnerNames.hasOwnProperty(name)) {
                    partners[name] = collection[partnerNames[name]];
                }
            }

            thing.partners = {};
        }

        /**
         * Spawning callback for RandomSpawner Things, which generate a set of 
         * commands using the WorldSeeder to be piped into the MapsHandlr, then 
         * spawn the immediate area.
         * 
         * @param {RandomSpawner} thing
         */
        spawnRandomSpawner(thing: IRandomSpawner): void {
            var FSM: FullScreenMario = thing.FSM,
                left: number = (thing.left + FSM.MapScreener.left) / FSM.unitsize;

            FSM.WorldSeeder.clearGeneratedCommands();
            FSM.WorldSeeder.generateFull({
                "title": thing.randomization,
                "top": thing.randomTop,
                "right": left + thing.randomWidth,
                "bottom": thing.randomBottom,
                "left": left,
                "width": thing.randomWidth,
                "height": thing.randomTop - thing.randomBottom
            });
            FSM.WorldSeeder.runGeneratedCommands();

            FSM.MapsHandler.spawnMap(
                "xInc",
                FSM.QuadsKeeper.top / FSM.unitsize,
                FSM.QuadsKeeper.right / FSM.unitsize,
                FSM.QuadsKeeper.bottom / FSM.unitsize,
                FSM.QuadsKeeper.left / FSM.unitsize);
        }

        /**
         * Activation callback for starting spawnRandomCheep on an interval.
         * MapScreener is notified that spawningCheeps is true.
         * 
         * @param {Detector} thing
         */
        activateCheepsStart(thing: IDetector): void {
            thing.FSM.MapScreener.spawningCheeps = true;
            thing.FSM.TimeHandler.addEventInterval(thing.FSM.spawnRandomCheep, 21, Infinity, thing.FSM);
        }

        /**
         * Activation callback to stop spawning CheepCheeps. MapScreener is notified
         * that spawningCheeps is false.
         * 
         * @param {Detector} thing
         */
        activateCheepsStop(thing: IDetector): void {
            thing.FSM.MapScreener.spawningCheeps = false;
        }

        /**
         * Activation callback for starting spawnRandomBulletBill on an interval.
         * MapScreener is notified that spawningBulletBills is true.
         * 
         * @param {Detector} thing
         */
        activateBulletBillsStart(thing: IDetector): void {
            thing.FSM.MapScreener.spawningBulletBills = true;
            thing.FSM.TimeHandler.addEventInterval(thing.FSM.spawnRandomBulletBill, 210, Infinity, thing.FSM);
        }

        /**
         * Activation callback to stop spawning BulletBills. MapScreener is notified
         * that spawningBulletBills is false.
         * 
         * @param {Detector} thing
         */
        activateBulletBillsStop(thing: IDetector): void {
            thing.FSM.MapScreener.spawningBulletBills = false;
        }

        /**
         * Activation callback to tell the area's Lakitu, if it exists, to start 
         * fleeing the scene.
         * 
         * @param {Detector} thing
         */
        activateLakituStop(thing: IDetector): void {
            var lakitu: ILakitu = thing.FSM.MapScreener.lakitu;

            if (!lakitu) {
                return;
            }

            lakitu.fleeing = true;
            lakitu.movement = thing.FSM.moveLakituFleeing;
        }

        /**
         * Activation callback for a warp world area, triggered by the player 
         * touching a collider on top of it. Piranhas disappear and texts are
         * revealed.
         * 
         * @param {Thing} player
         * @param {DetectCollision} other
         */
        activateWarpWorld(thing: ICharacter, other: IDetectCollision): void {
            var collection: any = other.collection,
                key: number = 0,
                keyString: string,
                texts: IThing[],
                j: number;

            if (!thing.player) {
                return;
            }

            texts = collection.Welcomer.children;
            for (j = 0; j < texts.length; j += 1) {
                if (texts[j].title !== "TextSpace") {
                    texts[j].hidden = false;
                }
            }

            while (true) {
                keyString = key + "-Text";
                if (!collection.hasOwnProperty(keyString)) {
                    break;
                }

                texts = collection[keyString].children;
                for (j = 0; j < texts.length; j += 1) {
                    if (texts[j].title !== "TextSpace") {
                        texts[j].hidden = false;
                    }
                }

                thing.FSM.killNormal(collection[key + "-Piranha"]);

                key += 1;
            }
        }

        /**
         * Activation callback for when the player lands on a RestingStone. The 
         * stone "appears" (via opacity), the regular theme plays if it wasn't 
         * already, and the RestingStone waits to kill itself when the player isn't
         * touching it.
         * 
         * @param {RestingStone} thing
         * @param {Player} other
         */
        activateRestingStone(thing: IRestingStone, other: IPlayer): void {
            if (thing.activated) {
                return;
            }

            thing.activated = true;
            thing.opacity = 1;
            thing.FSM.AudioPlayer.playTheme();

            thing.FSM.TimeHandler.addEventInterval(
                function (): boolean {
                    if (other.resting === thing) {
                        return false;
                    }

                    thing.FSM.killNormal(thing);
                    return true;
                },
                1,
                Infinity);
        }

        /**
         * Generic activation callback for DetectWindow Things. This is typically 
         * set as a .movement Function, so it waits until the calling Thing is 
         * within the MapScreener's area to call the activate Function and kill 
         * itself.
         * 
         * @param {DetectWindow} thing
         */
        activateWindowDetector(thing: IDetectWindow): void {
            if (thing.FSM.MapScreener.right - thing.FSM.MapScreener.left < thing.left) {
                return;
            }

            thing.activate(thing);
            thing.FSM.killNormal(thing);
        }

        /**
         * Activation callback for ScrollBlocker Things. These are WindowDetectors
         * that set MapScreener.canscroll to false when they're triggered. If the
         * latest scrollWindow call pushed it too far to the left, it scrolls back
         * the other way.
         * 
         * @param {ScrollBlocker} thing
         */
        activateScrollBlocker(thing: IScrollBlocker): void {
            var dx: number = thing.FSM.MapScreener.width - thing.left;

            thing.FSM.MapScreener.canscroll = false;
            if (thing.setEdge && dx > 0) {
                thing.FSM.scrollWindow(-dx);
            }
        }

        /**
         * Activation callback for ScrollBlocker Things. These are DetectCollision
         * that set MapScreener.canscroll to true when they're triggered. 
         * 
         * @param {DetectCollision} thing
         */
        activateScrollEnabler(thing: IDetectCollision): void {
            thing.FSM.MapScreener.canscroll = true;
        }

        /**
         * Activates the "before" component of a stretchable section. The creation
         * commands of the section are loaded onto the screen as is and a 
         * DetectWindow is added to their immediate right that will trigger the 
         * equivalent activateSectionStretch.
         * 
         * @param {DetectWindow} thing
         */
        activateSectionBefore(thing: ISectionDetector): void {
            var FSM: FullScreenMario = thing.FSM,
                MapsCreator: MapsCreatr.MapsCreatr = FSM.MapsCreator,
                MapScreener: MapScreenr.MapScreenr = FSM.MapScreener,
                MapsHandler: MapsHandlr.MapsHandlr = FSM.MapsHandler,
                area: IArea = <IArea>MapsHandler.getArea(),
                map: MapsCreatr.IMapsCreatrMap = MapsHandler.getMap(),
                prethings: { [i: string]: MapsCreatr.IPreThing[] } = MapsHandler.getPreThings(),
                section: any = area.sections[thing.section || 0],
                left: number = (thing.left + MapScreener.left) / FSM.unitsize,
                before: any[] = section.before ? section.before.creation : undefined,
                command: any,
                i: number;

            // If there is a before, parse each command into the prethings array
            if (before) {
                for (i = 0; i < before.length; i += 1) {
                    // A copy of the command must be used to not modify the original 
                    command = FSM.proliferate({}, before[i]);

                    // The command's x must be shifted by the thing's placement
                    if (!command.x) {
                        command.x = left;
                    } else {
                        command.x += left;
                    }

                    // For Platforms that slide around, start and end are dynamic
                    if (command.sliding) {
                        command.begin += left;
                        command.end += left;
                    }

                    MapsCreator.analyzePreSwitch(command, prethings, area, map);
                }
            }

            // Add a prething at the end of all this to trigger the stretch part
            command = {
                "thing": "DetectWindow",
                "x": left + (before ? section.before.width : 0), "y": 0,
                "activate": FSM.activateSectionStretch,
                "section": thing.section || 0
            };

            MapsCreator.analyzePreSwitch(command, prethings, area, map);

            // Spawn new Things that should be placed for being nearby
            MapsHandler.spawnMap(
                "xInc",
                MapScreener.top / FSM.unitsize,
                (MapScreener.left + FSM.QuadsKeeper.right) / FSM.unitsize,
                MapScreener.bottom / FSM.unitsize,
                left);
        }

        /**
         * Activates the "stretch" component of a stretchable section. The creation
         * commands of the section are loaded onto the screen and have their widths
         * set to take up the entire width of the screen. A DetectWindow is added
         * to their immediate right that will trigger the equivalent
         * activateSectionAfter.
         * 
         * @param {DetectWindow} thing
         */
        activateSectionStretch(thing: ISectionDetector): void {
            var FSM: FullScreenMario = thing.FSM,
                MapsCreator: MapsCreatr.MapsCreatr = FSM.MapsCreator,
                MapScreener: MapScreenr.MapScreenr = FSM.MapScreener,
                MapsHandler: MapsHandlr.MapsHandlr = FSM.MapsHandler,
                area: IArea = <IArea>MapsHandler.getArea(),
                map: MapsCreatr.IMapsCreatrMap = MapsHandler.getMap(),
                prethings: { [i: string]: MapsCreatr.IPreThing[] } = MapsHandler.getPreThings(),
                section: any = area.sections[thing.section || 0],
                stretch: any[] = section.stretch ? section.stretch.creation : undefined,
                left: number = (thing.left + MapScreener.left) / FSM.unitsize,
                width: number = MapScreener.width / FSM.unitsize,
                command: IPreThingSettings,
                i: number;

            // If there is a stretch, parse each command into the current prethings array
            if (stretch) {
                for (i = 0; i < stretch.length; i += 1) {
                    // A copy of the command must be used, so the original isn't modified
                    command = FSM.proliferate({}, stretch[i]);
                    command.x = left;

                    // "stretch" the command by making its width equal to the screen
                    command.width = width;
                    MapsCreator.analyzePreSwitch(command, prethings, area, map);
                }

                // Add a prething at the end of all this to trigger the after part
                command = {
                    "thing": "DetectWindow",
                    "x": left + width,
                    "y": 0,
                    "activate": FSM.activateSectionAfter,
                    "section": thing.section || 0
                };
                MapsCreator.analyzePreSwitch(command, prethings, area, map);
            }

            // Spawn the map, so new Things that should be placed will be spawned if nearby
            MapsHandler.spawnMap(
                "xInc",
                MapScreener.top / FSM.unitsize,
                left + (MapScreener.width / FSM.unitsize),
                MapScreener.bottom / FSM.unitsize,
                left);
        }

        /**
         * Activates the "after" component of a stretchable sectin. The creation
         * commands of the stretch are loaded onto the screen as is.
         * 
         * @param {DetectWindow} thing
         */
        activateSectionAfter(thing: ISectionDetector): void {
            // Since the section was passed, do the rest of things normally
            var FSM: FullScreenMario = thing.FSM,
                MapsCreator: MapsCreatr.MapsCreatr = FSM.MapsCreator,
                MapScreener: MapScreenr.MapScreenr = FSM.MapScreener,
                MapsHandler: MapsHandlr.MapsHandlr = FSM.MapsHandler,
                area: IArea = <IArea>MapsHandler.getArea(),
                map: MapsCreatr.IMapsCreatrMap = MapsHandler.getMap(),
                prethings: { [i: string]: MapsCreatr.IPreThing[] } = MapsHandler.getPreThings(),
                section: any = area.sections[thing.section || 0],
                left: number = (thing.left + MapScreener.left) / FSM.unitsize,
                after: any[] = section.after ? section.after.creation : undefined,
                command: any,
                i: number;

            // If there is an after, parse each command into the current prethings array
            if (after) {
                for (i = 0; i < after.length; i += 1) {
                    // A copy of the command must be used, so the original isn't modified
                    command = FSM.proliferate({}, after[i]);

                    // The command's x-location must be shifted by the thing's placement
                    if (!command.x) {
                        command.x = left;
                    } else {
                        command.x += left;
                    }

                    // For Platforms that slide around, start and end are dynamic
                    if (command.sliding) {
                        command.begin += left;
                        command.end += left;
                    }

                    MapsCreator.analyzePreSwitch(command, prethings, area, map);
                }
            }

            // Spawn the map, so new Things that should be placed will be spawned if nearby
            MapsHandler.spawnMap(
                "xInc",
                MapScreener.top / FSM.unitsize,
                left + (MapScreener.right / FSM.unitsize),
                MapScreener.bottom / FSM.unitsize,
                left);
        }


        /* Collision functions
        */

        /**
         * Function generator for the generic hitCharacterSolid callback. This is 
         * used repeatedly by ThingHittr to generate separately optimized Functions
         * for different Thing types.
         * 
         * @return {Function}
         */
        generateHitCharacterSolid(): (thing: ICharacter, other: ISolid) => void {
            /**
             * Generic callback for when a character touches a solid. Solids that 
             * "up" kill anything that didn't cause the up, but otherwise this will
             * normally involve the solid's collide callback being called and
             * under/undermid checks activating.
             * 
             * @param {Character} thing
             * @param {Solid} other
             */
            return function hitCharacterSolid(thing: ICharacter, other: ISolid): void {
                // "Up" solids are special (they kill things that aren't their .up)
                if (other.up && thing !== other.up) {
                    return thing.FSM.collideCharacterSolidUp(thing, other);
                }

                other.collide(thing, other);

                // If a character is bumping into the bottom, call that
                if (thing.undermid) {
                    if (thing.undermid.bottomBump) {
                        thing.undermid.bottomBump(thing.undermid, thing);
                    }
                } else if (thing.under && thing.under && (<any>thing.under).bottomBump) {
                    (<any>thing.under).bottomBump(thing.under[0], thing);
                }

                // If the character is overlapping the solid, call that too
                if (
                    thing.checkOverlaps
                    && thing.FSM.isCharacterOverlappingSolid(thing, other)) {
                    thing.FSM.markOverlap(<ICharacterOverlapping>thing, other);
                }
            };
        }

        /**
         * Function generator for the generic hitCharacterCharacter callback. This
         * is used repeatedly by ThingHittr to generate separately optimized 
         * Functions for different Thing types.
         * 
         * @return {Function}
         */
        generateHitCharacterCharacter(): (thing: ICharacter, other: ICharacter) => void {
            /**
             * Generic callback for when a character touches another character. The
             * first Thing's collide callback is called unless it's a player, in 
             * which the other Thing's is.
             *  
             * @param {Character} thing
             * @param {Character} other
             */
            return function hitCharacterCharacter(thing: ICharacter, other: ICharacter): void {
                // The player calls the other's collide function, such as playerStar
                if (thing.player) {
                    if (other.collide) {
                        return other.collide(thing, other);
                    }
                } else if (thing.collide) {
                    // Otherwise just use thing's collide function
                    thing.collide(other, thing);
                }
            };
        }

        /**
         * Collision callback used by most Items. The item's action callback will
         * be called only if the first Thing is a player.
         * 
         * @param {Thing} thing
         * @param {Item} other
         */
        collideFriendly(thing: ICharacter, other: IItem): void {
            if (!thing.player || !thing.FSM.isThingAlive(other)) {
                return;
            }

            if (other.action) {
                other.action(<IPlayer>thing, other);
            }

            other.death(other);
        }

        /**
         * General callback for when a character touches a solid. This mostly 
         * determines if the character is on top (it should rest on the solid), to
         * the side (it should shouldn't overlap), or undernearth (it also shouldn't
         * overlap).
         * 
         * @param {Character} thing
         * @param {Solid} other
         */
        collideCharacterSolid(thing: ICharacter, other: ISolid): void {
            if (other.up === thing) {
                return;
            }

            // Character on top of solid
            if (thing.FSM.isCharacterOnSolid(thing, other)) {
                if (other.hidden && !other.collideHidden) {
                    return;
                }

                if (thing.resting !== other) {
                    thing.resting = other;
                    if (thing.onResting) {
                        thing.onResting(thing, other);
                    }
                    if (other.onRestedUpon) {
                        other.onRestedUpon(other, thing);
                    }
                }
            } else if (thing.FSM.isSolidOnCharacter(other, thing)) {
                // Solid on top of character
                var midx: number = thing.FSM.getMidX(thing);

                if (midx > other.left && midx < other.right) {
                    thing.undermid = other;
                } else if (other.hidden && !other.collideHidden) {
                    return;
                }

                if (!thing.under) {
                    thing.under = [other];
                } else {
                    thing.under.push(other);
                }

                if (thing.player) {
                    (<IPlayer>thing).keys.jump = false;
                    thing.FSM.setTop(thing, other.bottom - thing.toly + other.yvel);
                }

                thing.yvel = other.yvel;
            }

            if (other.hidden && !other.collideHidden) {
                return;
            }

            // Character bumping into the side of the solid
            if (
                thing.resting !== other
                && !thing.FSM.isCharacterBumpingSolid(thing, other)
                && !thing.FSM.isThingOnThing(thing, other)
                && !thing.FSM.isThingOnThing(other, thing)
                && !thing.under
                ) {
                // Character to the left of the solid
                if (thing.right <= other.right) {
                    thing.xvel = Math.min(thing.xvel, 0);
                    thing.FSM.shiftHoriz(
                        thing,
                        Math.max(
                            other.left + thing.FSM.unitsize - thing.right,
                            thing.FSM.unitsize / -2
                            )
                        );
                } else {
                    // Character to the right of the solid
                    thing.xvel = Math.max(thing.xvel, 0);
                    thing.FSM.shiftHoriz(
                        thing,
                        Math.min(
                            other.right - thing.FSM.unitsize - thing.left,
                            thing.FSM.unitsize / 2
                            )
                        );
                }

                // Non-players flip horizontally
                if (!thing.player) {
                    if (!thing.noflip) {
                        thing.moveleft = !thing.moveleft;
                    }
                    // Some items require fancy versions (e.g. Shell)
                    if (thing.group === "item") {
                        thing.collide(other, thing);
                    }
                } else if (other.actionLeft) {
                    // Players trigger other actions (e.g. Pipe's mapExitPipeHorizontal)
                    thing.FSM.ModAttacher.fireEvent("onPlayerActionLeft", thing, other);
                    other.actionLeft(thing, other, other.transport);
                }
            }
        }

        /**
         * Collision callback for a character hitting an "up" solid. If it has an
         * onCollideUp callback, that is called; otherwise, it is killed.
         * 
         * @param {Character} thing
         * @param {Solid} other
         */
        collideCharacterSolidUp(thing: ICharacter, other: ISolid): void {
            if (thing.onCollideUp) {
                thing.onCollideUp(thing, other);
            } else {
                thing.FSM.scoreOn(thing.scoreBelow, thing);
                thing.death(thing, 2);
            }
        }

        /**
         * Collision callback for an item hitting an "up" solid. Items just hop
         * and switch direction.
         * 
         * @param {Item} thing
         * @param {Solid} other
         */
        collideUpItem(thing: ICharacter, other: ISolid): void {
            thing.FSM.animateCharacterHop(thing);
            thing.moveleft = thing.FSM.objectToLeft(thing, other);
        }

        /**
         * Collision callback for a floating coin being hit by an "up" solid. It is
         * animated, as if it were hit as the contents of a solid.
         * 
         * @param {Coin} thing
         * @param {Solid} other
         */
        collideUpCoin(thing: ICoin, other: ISolid): void {
            thing.blockparent = other;
            thing.animate(thing, other);
        }

        /**
         * Collision callback for a player hitting a regular Coin. The Coin
         * disappears but points and Coin totals are both increased, along with
         * the "Coin" sound being played.
         * 
         * @param {Player} thing
         * @param {Coin} other
         */
        collideCoin(thing: IPlayer, other: ICoin): void {
            if (!thing.player) {
                return;
            }

            thing.FSM.AudioPlayer.play("Coin");
            thing.FSM.ItemsHolder.increase("score", 200);
            thing.FSM.ItemsHolder.increase("coins", 1);
            thing.FSM.killNormal(other);
        }

        /**
         * Collision callback for a player hitting a Star. The Star is killed, and
         * the playerStarUp trigger is called on the Thing.
         * 
         * @param {Player} thing
         * @param {Star} other
         */
        collideStar(thing: IPlayer, other: IStar): void {
            if (!thing.player || thing.star) {
                return;
            }

            thing.FSM.playerStarUp(thing);
            thing.FSM.ModAttacher.fireEvent("onCollideStar", thing, other);
        }

        /**
         * Collision callback for a character being hit by a fireball. It will
         * most likely be killed with an explosion unless it has the nofiredeath 
         * flag, in which case only the fireball dies.
         * 
         * @param {Character} thing
         * @param {Fireball} other
         */
        collideFireball(thing: ICharacter, other: IFireball): void {
            if (
                !thing.FSM.isThingAlive(thing)
                || thing.height < thing.FSM.unitsize
                ) {
                return;
            }

            if (thing.nofire) {
                if (thing.nofire > 1) {
                    other.death(other);
                }
                return;
            }

            if (thing.nofiredeath) {
                thing.FSM.AudioPlayer.playLocal(
                    "Bump", thing.FSM.getMidX(other));
                thing.death(thing);
            } else {
                thing.FSM.AudioPlayer.playLocal(
                    "Kick", thing.FSM.getMidX(other));
                thing.death(thing, 2);
                thing.FSM.scoreOn(thing.scoreFire, thing);
            }

            other.death(other);
        }

        /**
         * Collision callback for hitting a CastleFireball. The character is killed
         * unless it has the star flag, in which case the CastleFireball is.
         * 
         * @param {Character} thing
         * @param {CastleFireball} other
         */
        collideCastleFireball(thing: ICharacter, other: ICastleFireball): void {
            if ((<any>thing).star) {
                other.death(other);
            } else {
                thing.death(thing);
            }
        }

        /**
         * Collision callback for when a character hits a Shell. This covers various
         * cases, such as deaths, side-to-side Shell collisions, player stomps, and
         * so on.
         * 
         * @param {Character} thing
         * @param {Shell} other
         */
        collideShell(thing: ICharacter, other: IShell): void {
            // If only one is a shell, it should be other, not thing
            if (thing.shell) {
                if (other.shell) {
                    return thing.FSM.collideShellShell(<IShell>thing, other);
                }
                return thing.FSM.collideShell(thing, other);
            }

            // Hitting a solid (e.g. wall) 
            if (thing.groupType === "Solid") {
                return thing.FSM.collideShellSolid(<any>thing, other);
            }

            // Hitting the player
            if (thing.player) {
                return thing.FSM.collideShellPlayer(<any>thing, <any>other);
            }

            // Assume anything else to be an enemy, which only moving shells kill
            if (other.xvel) {
                thing.FSM.killFlip(thing);
                if (thing.shellspawn) {
                    thing = <any>thing.FSM.killSpawn(thing);
                }

                thing.FSM.AudioPlayer.play("Kick");
                thing.FSM.scoreOn(thing.FSM.findScore(other.enemyhitcount), thing);
                other.enemyhitcount += 1;
            } else {
                thing.moveleft = thing.FSM.objectToLeft(thing, other);
            }
        }

        /**
         * Collision callback for a solid being hit by a Shell. The Shell will 
         * bounce the opposition direction.
         * 
         * @param {Solid} thing
         * @param {Shell} other
         */
        collideShellSolid(thing: ISolid, other: IShell): void {
            if (other.right < thing.right) {
                thing.FSM.AudioPlayer.playLocal("Bump", thing.left);
                thing.FSM.setRight(other, thing.left);
                other.xvel = -other.speed;
                other.moveleft = true;
            } else {
                thing.FSM.AudioPlayer.playLocal("Bump", thing.right);
                thing.FSM.setLeft(other, thing.right);
                other.xvel = other.speed;
                other.moveleft = false;
            }
        }

        /**
         * Collision callback for when the player hits a Shell. This covers all the
         * possible scenarios, and is much larger than common sense dictates.
         * 
         * @param {Player} thing
         * @param {Shell} other
         */
        collideShellPlayer(thing: IPlayer, other: IShell): void {
            var shelltoleft: boolean = thing.FSM.objectToLeft(other, thing),
                playerjump: boolean = thing.yvel > 0 && (
                    thing.bottom <= other.top + thing.FSM.unitsize * 2);

            // Star players kill the shell no matter what
            if (thing.star) {
                thing.FSM.scorePlayerShell(thing, other);
                other.death(other, 2);
                return;
            }

            // If the shell is already being landed on by the player, see if it's
            // still being pushed to the side, or has reversed direction (is deadly)
            if (other.landing) {
                // Equal shelltoleft measurements: it's still being pushed
                if (other.shelltoleft === shelltoleft) {
                    // Tepmorarily increase the landing count of the shell; if it is 
                    // just being started, that counts as the score hit
                    other.landing += 1;
                    if (other.landing === 1) {
                        thing.FSM.scorePlayerShell(thing, other);
                    }
                    thing.FSM.TimeHandler.addEvent(
                        function (other: IShell): void {
                            other.landing -= 1;
                        },
                        2,
                        other);
                } else {
                    // Different shelltoleft measurements: it's deadly
                    thing.death(thing);
                }
                return;
            }

            // If the shell is being kicked by the player, either by hitting a still
            // shell or jumping onto an already moving one
            if (other.xvel === 0 || playerjump) {
                // Reset any signs of peeking from the shell
                other.counting = 0;

                // If the shell is standing still, make it move
                if (other.xvel === 0) {
                    thing.FSM.AudioPlayer.play("Kick");
                    thing.FSM.scorePlayerShell(thing, other);
                    if (shelltoleft) {
                        other.moveleft = true;
                        other.xvel = -other.speed;
                    } else {
                        other.moveleft = false;
                        other.xvel = other.speed;
                    }
                    other.hitcount += 1;
                    thing.FSM.TimeHandler.addEvent(
                        function (other: IShell): void {
                            other.hitcount -= 1;
                        },
                        2,
                        other);
                } else {
                    // Otherwise it was moving, but should now be still
                    other.xvel = 0;
                }

                if (other.peeking) {
                    other.peeking = 0;
                    thing.FSM.removeClass(other, "peeking");
                    other.height -= thing.FSM.unitsize / 8;
                    thing.FSM.updateSize(other);
                }

                // If the player is landing on the shell (with movements and xvels
                // already set), the player should then jump up a bit
                if (playerjump) {
                    thing.FSM.AudioPlayer.play("Kick");

                    if (!other.xvel) {
                        thing.FSM.jumpEnemy(thing, other);
                        thing.yvel *= 2;
                        // thing.FSM.scorePlayerShell(thing, other);
                        thing.FSM.setBottom(thing, other.top - thing.FSM.unitsize);
                    } else {
                        // thing.FSM.scorePlayerShell(thing, other);
                    }

                    other.landing += 1;
                    other.shelltoleft = shelltoleft;
                    thing.FSM.TimeHandler.addEvent(
                        function (other: IShell): void {
                            other.landing -= 1;
                        },
                        2,
                        other);
                }
            } else {
                // Since the player is touching the shell normally, that's a death if
                // the shell isn't moving away
                if (!other.hitcount && (
                    (shelltoleft && other.xvel > 0)
                    || (!shelltoleft && other.xvel < 0)
                    )) {
                    thing.death(thing);
                }
            }
        }

        /**
         * Collision callback for two Shells. If one is moving, it kills the other;
         * otherwise, they bounce off.
         * 
         * @param {Shell} thing
         * @param {Shell} other
         */
        collideShellShell(thing: IShell, other: IShell): void {
            if (thing.xvel !== 0) {
                if (other.xvel !== 0) {
                    var temp: number = thing.xvel;
                    thing.xvel = other.xvel;
                    other.xvel = temp;

                    thing.FSM.shiftHoriz(thing, thing.xvel);
                    thing.FSM.shiftHoriz(other, other.xvel);
                } else {
                    thing.FSM.ItemsHolder.increase("score", 500);
                    other.death(other);
                }
            } else {
                thing.FSM.ItemsHolder.increase("score", 500);
                thing.death(thing);
            }
        }

        /**
         * Collision callback for a general character hitting an enemy. This covers
         * many general cases, most of which involve a player and an enemy.
         * 
         * @param {Character} thing
         * @param {Enemy} other
         */
        collideEnemy(thing: ICharacter, other: IEnemy): void {
            // If either is a player, make it thing (not other)
            if (!thing.player && other.player) {
                return thing.FSM.collideEnemy(thing, other);
            }

            // Death: nothing happens
            if (
                !thing.FSM.isThingAlive(thing)
                || !thing.FSM.isThingAlive(other)
                ) {
                return;
            }

            // Items
            if (thing.group === "item") {
                if (thing.collidePrimary) {
                    return thing.collide(other, thing);
                }
                return;
            }

            // For non-players, it's just to characters colliding: they bounce
            if (!thing.player) {
                thing.moveleft = thing.FSM.objectToLeft(thing, other);
                other.moveleft = !thing.moveleft;
                return;
            }

            // Player landing on top of an enemy
            if (
                ((<IStar>thing).star && !other.nostar)
                || (
                    !thing.FSM.MapScreener.underwater
                    && (!other.deadly && thing.FSM.isThingOnThing(thing, other))
                    )
                ) {
                // For the sake of typing. Should be optimized during runtime.
                var player: IPlayer = <IPlayer>thing;

                // Enforces toly (not touching means stop)
                if (player.FSM.isCharacterAboveEnemy(player, other)) {
                    return;
                }

                // A star player just kills the enemy, no matter what
                if (player.star) {
                    other.nocollide = true;
                    other.death(other, 2);
                    player.FSM.scoreOn(other.scoreStar, other);
                    player.FSM.AudioPlayer.play("Kick");
                } else {
                    // A non-star player kills the enemy with spawn, and hops
                    player.FSM.setBottom(
                        player,
                        Math.min(player.bottom, other.top + player.FSM.unitsize)
                        );
                    player.FSM.TimeHandler.addEvent(player.FSM.jumpEnemy, 0, player, other);

                    other.death(other, player.star ? 2 : 0);

                    player.FSM.addClass(player, "hopping");
                    player.FSM.removeClasses(
                        player, "running skidding jumping one two three"
                        );
                    player.hopping = true;

                    if (player.power === 1) {
                        player.FSM.setPlayerSizeSmall(player);
                    }
                }
            } else if (!thing.FSM.isCharacterAboveEnemy(thing, other)) {
                // Player being landed on by an enemy
                thing.death(thing);
            }
        }


        /**
         * Collision callback for a character bumping into the bottom of a solid.
         * Only players cause the solid to jump and be considered "up", though large
         * players will kill solids that have the breakable flag on. If the solid 
         * does jump and has contents, they emerge.
         * 
         * @param {Solid} thing
         * @param {Character} other
         */
        collideBottomBrick(thing: IBrick, other: ICharacter): void {
            if ((<any>other).solid && !thing.solid) {
                return thing.FSM.collideBottomBrick(<any>other, <any>thing);
            }

            if (thing.up || !other.player) {
                return;
            }

            thing.FSM.AudioPlayer.play("Bump");

            if (thing.used) {
                return;
            }

            thing.up = other;
            if ((<IPlayer>other).power > 1 && thing.breakable && !thing.contents) {
                thing.FSM.TimeHandler.addEvent(
                    thing.FSM.killBrick, 2, thing, other);
                return;
            }

            thing.FSM.animateSolidBump(thing);

            if (thing.contents) {
                thing.FSM.TimeHandler.addEvent(
                    function (): void {
                        thing.FSM.animateSolidContents(thing, <any>other);

                        if (thing.contents !== "Coin") {
                            thing.FSM.animateBlockBecomesUsed(<any>thing);
                        } else {
                            if (thing.lastcoin) {
                                thing.FSM.animateBlockBecomesUsed(<any>thing);
                            } else {
                                thing.FSM.TimeHandler.addEvent(
                                    function (): void {
                                        thing.lastcoin = true;
                                    },
                                    245);
                            }
                        }
                    },
                    7);
            }
        }

        /**
         * Collision callback for the player hitting the bottom of a Block. Unused
         * Blocks have their contents emerge (by default a Coin), while used Blocks
         * just have a small bump noise played.
         * 
         * @param {Solid} thing
         * @param {Player} other
         */
        collideBottomBlock(thing: IBlock, other: IPlayer): void {
            if ((<any>other).solid && !thing.solid) {
                return thing.FSM.collideBottomBlock(<any>other, <any>thing);
            }

            if (thing.up || !other.player) {
                return;
            }

            if (thing.used) {
                thing.FSM.AudioPlayer.play("Bump");
                return;
            }

            thing.used = true;
            thing.hidden = false;
            thing.up = other;

            thing.FSM.animateSolidBump(thing);
            thing.FSM.removeClass(thing, "hidden");
            thing.FSM.switchClass(thing, "unused", "used");
            thing.FSM.TimeHandler.addEvent(
                thing.FSM.animateSolidContents, 7, thing, other);
        }

        /**
         * Collision callback for Vines. The player becomes "attached" to the Vine
         * and starts climbing it, with movement set to movePlayerVine.
         * 
         * @param {Player} thing
         * @param {Solid} other
         */
        collideVine(thing: IPlayer, other: ISolid): void {
            if (!thing.player || thing.attachedSolid || thing.climbing) {
                return;
            }

            if (thing.bottom > other.bottom + thing.FSM.unitsize * 2) {
                return;
            }

            other.attachedCharacter = thing;
            thing.attachedSolid = other;

            thing.nofall = true;
            thing.checkOverlaps = false;
            thing.resting = undefined;

            // To the left of the vine
            if (thing.right < other.right) {
                thing.lookleft = false;
                thing.moveleft = false;
                thing.attachedDirection = -1;
                thing.FSM.unflipHoriz(thing);
            } else {
                // To the right of the vine
                thing.lookleft = true;
                thing.moveleft = true;
                thing.attachedDirection = 1;
                thing.FSM.flipHoriz(thing);
            }

            thing.FSM.thingPauseVelocity(thing);
            thing.FSM.addClass(thing, "climbing");
            thing.FSM.removeClasses(
                thing, "running", "jumping", "skidding");

            thing.FSM.TimeHandler.cancelClassCycle(thing, "running");
            thing.FSM.TimeHandler.addClassCycle(
                thing, ["one", "two"], "climbing", 0
                );

            thing.attachedLeft = !thing.FSM.objectToLeft(thing, other);
            thing.attachedOff = thing.attachedLeft ? 1 : -1;

            thing.movement = thing.FSM.movePlayerVine;
        }

        /**
         * Collision callback for a character hitting a Springboard. This acts as a
         * normal solid to non-players, and only acts as a spring if the player is
         * above it and moving down.
         * 
         * @param {Character} thing
         * @param {Springboard} other
         */
        collideSpringboard(thing: ICharacter, other: ISpringboard): void {
            if (
                thing.player && thing.yvel >= 0 && !other.tension
                && thing.FSM.isCharacterOnSolid(thing, other)
                ) {
                other.tension = other.tensionSave = Math.max(
                    thing.yvel * 0.77,
                    thing.FSM.unitsize
                    );
                thing.movement = thing.FSM.movePlayerSpringboardDown;
                (<IPlayer>thing).spring = other;
                thing.xvel /= 2.8;
            } else {
                thing.FSM.collideCharacterSolid(thing, other);
            }
        }

        /**
         * Collision callback for a character hitting a WaterBlocker on the top of
         * an underwater area. It simply stops them from moving up.
         * 
         * @param {Character} thing
         * @param {WaterBlocker} other
         */
        collideWaterBlocker(thing: ICharacter, other: ISolid): void {
            thing.FSM.collideCharacterSolid(thing, other);
        }

        /**
         * Collision callback for the DetectCollision on a flagpole at the end of an
         * EndOutsideCastle. The player becomes invincible and starts sliding down
         * the flagpole, while all other Things are killed. A score calculated by
         * scorePlayerFlag is shown at the base of the pole and works its way up. 
         * The collideFlagBottom callback will be fired when the player reaches the 
         * bottom. 
         * 
         * @param {Player} thing
         * @param {DetectCollision} other
         */
        collideFlagpole(thing: IPlayer, other: IDetectCollision): void {
            if (thing.bottom > other.bottom) {
                return;
            }

            var height: number = (other.bottom - thing.bottom) | 0,
                scoreAmount: number = thing.FSM.scorePlayerFlag(
                    thing, height / thing.FSM.unitsize),
                scoreThing: IText = thing.FSM.ObjectMaker.make("Text" + scoreAmount);

            // This is a cutscene. No movement, no deaths, no scrolling.
            thing.star = 1;
            thing.nocollidechar = true;
            thing.FSM.MapScreener.nokeys = true;
            thing.FSM.MapScreener.notime = true;
            thing.FSM.MapScreener.canscroll = false;

            // Kill all other characters and pause the player next to the pole
            thing.FSM.killNPCs();
            thing.FSM.thingPauseVelocity(thing);
            thing.FSM.setRight(
                thing, other.left + thing.FSM.unitsize * 3
                );
            thing.FSM.killNormal(other);

            // The player is now climbing down the pole
            thing.FSM.removeClasses(thing, "running jumping skidding");
            thing.FSM.addClass(thing, "climbing animated");
            thing.FSM.TimeHandler.addClassCycle(
                thing, ["one", "two"], "climbing", 0);

            // Animate the Flag to the base of the pole
            thing.FSM.TimeHandler.addEventInterval(
                thing.FSM.shiftVert,
                1,
                64,
                other.collection.Flag,
                thing.FSM.unitsize);

            // Add a ScoreText element at the bottom of the flag and animate it up
            thing.FSM.addThing(scoreThing, other.right, other.bottom);
            thing.FSM.TimeHandler.addEventInterval(
                thing.FSM.shiftVert,
                1,
                72,
                scoreThing,
                -thing.FSM.unitsize);
            thing.FSM.TimeHandler.addEvent(
                thing.FSM.ItemsHolder.increase.bind(thing.FSM.ItemsHolder),
                72,
                "score",
                scoreAmount);

            // All audio stops, and the flagpole clip is played
            thing.FSM.AudioPlayer.clearAll();
            thing.FSM.AudioPlayer.clearTheme();
            thing.FSM.AudioPlayer.play("Flagpole");

            thing.FSM.TimeHandler.addEventInterval(
                function (): boolean {
                    // While the player hasn't reached the bottom yet, slide down
                    if (thing.bottom < other.bottom) {
                        thing.FSM.shiftVert(thing, thing.FSM.unitsize);
                        return false;
                    }

                    // If the flag hasn't reached it but the player has, don't move yet
                    if ((other.collection.Flag.bottom | 0) < (other.bottom | 0)) {
                        return false;
                    }

                    // The player is done climbing: trigger the flag bottom collision
                    thing.movement = undefined;
                    thing.FSM.setBottom(thing, other.bottom);
                    thing.FSM.TimeHandler.cancelClassCycle(
                        thing, "climbing"
                        );
                    thing.FSM.TimeHandler.addEvent(
                        function (): void {
                            thing.FSM.collideFlagBottom(thing, other);
                        },
                        21);

                    return true;
                },
                1,
                Infinity);
        }

        /**
         * Collision callback for when a player hits the bottom of a flagpole. It is
         * flipped horizontally, shifted to the other side of the pole, and the
         * animatePlayerOffPole callback is quickly timed.
         * 
         * @param {Player} thing
         * @param {Solid} other
         */
        collideFlagBottom(thing: IPlayer, other: ISolid): void {
            thing.keys.run = 1;
            thing.maxspeed = thing.walkspeed;

            thing.FSM.flipHoriz(thing);
            thing.FSM.shiftHoriz(
                thing,
                (thing.width + 1) * thing.FSM.unitsize);

            thing.FSM.TimeHandler.addEvent(
                function (): void {
                    thing.FSM.AudioPlayer.play("Stage Clear");
                    thing.FSM.animatePlayerOffPole(thing, true);
                },
                14);
        }

        /**
         * Collision callback for the player hitting a CastleAxe. The player and
         * screen are paused for 140 steps (other callbacks should be animating
         * the custcene).
         * 
         * @param {Player} thing
         * @param {CastleAxe} other
         */
        collideCastleAxe(thing: IPlayer, other: ICastleAxe): void {
            if (!thing.FSM.isThingAlive(thing)) {
                return;
            }

            if (
                thing.right < other.left + other.EightBitter.unitsize
                || thing.bottom > other.bottom - other.EightBitter.unitsize
                ) {
                return;
            }

            thing.FSM.thingPauseVelocity(thing);
            thing.FSM.killNormal(other);
            thing.FSM.killNPCs();

            thing.FSM.AudioPlayer.clearTheme();
            thing.FSM.MapScreener.nokeys = true;
            thing.FSM.MapScreener.notime = true;

            thing.FSM.TimeHandler.addEvent(
                function (): void {
                    thing.keys.run = 1;
                    thing.maxspeed = thing.walkspeed;
                    thing.FSM.thingResumeVelocity(thing);
                    thing.yvel = 0;
                    thing.FSM.MapScreener.canscroll = true;
                    thing.FSM.AudioPlayer.play("World Clear");
                },
                140);
        }

        /**
         * Collision callback for a player hitting the DetectCollision placed next 
         * a CastleDoor in EndOutsideCastle. Time is converted one step at a time to
         * score, after which animateEndLevelFireworks is called.
         * 
         * @param {Player} thing
         * @param {DetectCollision} other
         */
        collideCastleDoor(thing: IPlayer, other: IDetectCollision): void {
            var time: string = String(thing.FSM.ItemsHolder.getItem("time")),
                numFireworks: number = Number(time[time.length - 1]);

            thing.FSM.killNormal(thing);
            if (!thing.player) {
                return;
            }

            if (!(numFireworks === 1 || numFireworks === 3 || numFireworks === 6)) {
                numFireworks = 0;
            }

            if (thing.FSM.ItemsHolder.getItem("time") === Infinity) {
                thing.FSM.animateEndLevelFireworks(thing, other, numFireworks);
                return;
            }

            thing.FSM.TimeHandler.addEventInterval(
                function (): boolean {
                    thing.FSM.ItemsHolder.decrease("time");
                    thing.FSM.ItemsHolder.increase("score", 50);
                    thing.FSM.AudioPlayer.play("Coin");

                    if (thing.FSM.ItemsHolder.getItem("time") <= 0) {
                        thing.FSM.TimeHandler.addEvent(
                            function (): void {
                                thing.FSM.animateEndLevelFireworks(thing, other, numFireworks);
                            },
                            35);
                        return true;
                    }
                },
                1,
                Infinity);
        }

        /** 
         * Collision callback for a player reaching a castle's NPC. The ending text
         * chunks are revealed in turn, after which collideLevelTransport is called.
         * 
         * @param {Player} thing
         * @param {DetectCollision} other
         */
        collideCastleNPC(thing: IPlayer, other: IDetectCollision): void {
            var keys: any[] = other.collection.npc.collectionKeys,
                interval: number = 140,
                i: number = 0,
                j: number,
                letters: IThing[];

            thing.keys.run = 0;
            thing.FSM.killNormal(other);

            thing.FSM.TimeHandler.addEventInterval(
                function (): void {
                    letters = other.collection[keys[i]].children;

                    for (j = 0; j < letters.length; j += 1) {
                        if (letters[j].title !== "TextSpace") {
                            letters[j].hidden = false;
                        }
                    }

                    i += 1;
                },
                interval,
                keys.length);

            thing.FSM.TimeHandler.addEvent(
                function (): void {
                    thing.FSM.collideLevelTransport(thing, other);
                },
                280 + interval * keys.length);
        }

        /**
         * Collision callback for a player hitting the transportation Platform in
         * cloud worlds. The player collides with it as normal for solids, but if
         * the player is then resting on it, it becomes a normal moving platform
         * with only horizontal momentum.
         * 
         * @param {Player} thing
         * @param {Solid} other
         */
        collideTransport(thing: IPlayer, other: ISolid): void {
            if (!thing.player) {
                return;
            }

            thing.FSM.collideCharacterSolid(thing, other);
            if (thing.resting !== other) {
                return;
            }

            other.xvel = thing.FSM.unitsize / 2;
            other.movement = thing.FSM.movePlatform;
            other.collide = thing.FSM.collideCharacterSolid;
        }

        /**
         * General collision callback for DetectCollision Things. The real activate
         * callback is only hit if the Thing is a player; otherwise, an optional
         * activateFail may be activated. The DetectCollision is then killed if it
         * doesn't have the noActivateDeath flag.
         * 
         * @param {Thing} thing
         * @param {DetectCollision} other
         */
        collideDetector(thing: ICharacter, other: IDetectCollision): void {
            if (!thing.player) {
                if (other.activateFail) {
                    other.activateFail(thing);
                }
                return;
            }

            other.activate(thing, other);

            if (!other.noActivateDeath) {
                thing.FSM.killNormal(other);
            }
        }

        /**
         * Collision callback for level transports (any Thing with a .transport 
         * attribute). Depending on the transport, either the map or location are 
         * shifted to it.
         * 
         * @param {Player} thing
         * @param {Thing} other
         */
        collideLevelTransport(thing: IPlayer, other: ISolid): void {
            var transport: any = other.transport;

            if (!thing.player) {
                return;
            }

            if (typeof transport === "undefined") {
                throw new Error("No transport given to collideLevelTransport");
            }

            if (transport.constructor === String) {
                thing.FSM.setLocation(transport);
            } else if (typeof transport.map !== "undefined") {
                thing.FSM.setMap(transport.map);
            } else if (typeof transport.location !== "undefined") {
                thing.FSM.setLocation(transport.location);
            } else {
                throw new Error("Unknown transport type:" + transport);
            }
        }


        /* Movement functions
        */

        /**
         * Base, generic movement Function for simple characters. The Thing moves
         * at a constant rate in either the x or y direction, and switches direction
         * only if directed by the engine (e.g. when it hits a Solid)
         * 
         * @param {Character} thing
         * @remarks thing.speed is the only required member attribute; .direction
         *          and .moveleft should be set by the game engine.
         */
        moveSimple(thing: ICharacter): void {
            // If the thing is looking away from the intended direction, flip it
            if (thing.direction !== thing.moveleft) {
                // thing.moveleft is truthy: it should now be looking to the right
                if (thing.moveleft) {
                    thing.xvel = -thing.speed;
                    if (!thing.noflip) {
                        thing.FSM.unflipHoriz(thing);
                    }
                } else {
                    // thing.moveleft is falsy: it should now be looking to the left
                    thing.xvel = thing.speed;
                    if (!thing.noflip) {
                        thing.FSM.flipHoriz(thing);
                    }
                }
                thing.direction = thing.moveleft;
            }
        }

        /**
         * Extension of the moveSimple movement Function for Things that shouldn't
         * fall off the edge of their resting blocks
         * 
         * @param {Character} thing
         */
        moveSmart(thing: ICharacter): void {
            // Start off by calling moveSimple for normal movement
            thing.FSM.moveSimple(thing);

            // If this isn't resting, it's the same as moveSimple
            if (thing.yvel !== 0) {
                return;
            }

            if (!thing.resting || !thing.FSM.isCharacterOnResting(thing, thing.resting)) {
                if (thing.moveleft) {
                    thing.FSM.shiftHoriz(thing, thing.FSM.unitsize, true);
                } else {
                    thing.FSM.shiftHoriz(thing, -thing.FSM.unitsize, true);
                }
                thing.moveleft = !thing.moveleft;
            }


            // // Check for being over the edge in the direction of movement
            // if (thing.moveleft) {
            // if (thing.left + thing.FSM.unitsize <= thing.resting.left) {
            // thing.FSM.shiftHoriz(thing, thing.FSM.unitsize);
            // thing.moveleft = false;
            // }
            // } else {
            // if (thing.right - thing.FSM.unitsize >= thing.resting.right) {
            // thing.FSM.shiftHoriz(thing, -thing.FSM.unitsize);
            // thing.moveleft = true;
            // }
            // }
        }

        /**
         * Extension of the moveSimple movement Function for Things that should
         * jump whenever they start resting.
         * 
         * @param {Character} thing
         * @remarks thing.jumpheight is required to know how high to jump
         */
        moveJumping(thing: ICharacter): void {
            // Start off by calling moveSimple for normal movement
            thing.FSM.moveSimple(thing);

            // If .resting, jump!
            if (thing.resting) {
                thing.yvel = -Math.abs(thing.jumpheight);
                thing.resting = undefined;
            }
        }

        /**
         * Movement Function for Things that slide back and forth, such as 
         * HammerBros and Lakitus.
         * 
         * @remarks thing.counter must be a number set elsewhere, such as in a spawn
         *          Function.    
         */
        movePacing(thing: ICharacter): void {
            thing.counter += .007;
            thing.xvel = Math.sin(Math.PI * thing.counter) / 2.1;
        }

        /**
         * Movement Function for HammerBros. They movePacing, look towards the 
         * player, and have the nocollidesolid flag if they're jumping up or 
         * intentionally falling through a solid.
         * 
         * @param {HammerBro} thing
         */
        moveHammerBro(thing: IHammerBro): void {
            thing.FSM.movePacing(thing);
            thing.FSM.lookTowardsPlayer(thing);
            thing.nocollidesolid = thing.yvel < 0 || thing.falling;
        }

        /**
         * Movement Function for Bowser. Bowser always faces the player and 
         * movePaces if he's to the right of the player, or moves to the right if
         * he's to the left.
         * 
         * @param {Bowser} thing
         */
        moveBowser(thing: IBowser): void {
            // Facing to the right
            if (thing.flipHoriz) {
                // To the left of player: walk to the right
                if (
                    thing.FSM.objectToLeft(thing, thing.FSM.player)
                    ) {
                    thing.FSM.moveSimple(thing);
                } else {
                    // To the right of player: look to the left and movePacing as normal
                    thing.lookleft = thing.moveleft = true;
                    thing.FSM.unflipHoriz(thing);
                    thing.FSM.movePacing(thing);
                }
            } else {
                // Facing to the left
                // To the left of player: look and walk to the right
                if (
                    thing.FSM.objectToLeft(thing, thing.FSM.player)
                    ) {
                    thing.lookleft = thing.moveleft = false;
                    thing.FSM.flipHoriz(thing);
                    thing.FSM.moveSimple(thing);
                } else {
                    // To the right of the player: movePacing as normal
                    thing.FSM.movePacing(thing);
                }
            }
        }

        /**
         * Movement Function for Bowser's spewed fire. It has a ylev stored from
         * creation that will tell it when to stop changing its vertical 
         * velocity from this Function; otherwise, it shifts its vertical 
         * position to move to the ylev.
         * 
         * @param {BowserFire} thing
         */
        moveBowserFire(thing: IBowserFire): void {
            if (Math.round(thing.bottom) === Math.round(thing.ylev)) {
                thing.movement = undefined;
                return;
            }

            thing.FSM.shiftVert(
                thing,
                Math.min(Math.max(0, thing.ylev - thing.bottom), thing.FSM.unitsize));
        }

        /**
         * Movement function for Things that float up and down (vertically).
         * If the Thing has reached thing.begin or thing.end, it gradually switches
         * thing.yvel
         * 
         * @param {Thing} thing
         * @remarks thing.maxvel is used as the maximum absolute speed vertically
         * @remarks thing.begin and thing.end are used as the vertical endpoints;
         *          .begin is the bottom and .end is the top (since begin <= end)
         */
        moveFloating(thing: IThingFloating): void {
            // If above the endpoint:
            if (thing.top <= thing.end) {
                thing.yvel = Math.min(thing.yvel + thing.FSM.unitsize / 64, thing.maxvel);
            } else if (thing.bottom >= thing.begin) {
                // If below the endpoint:
                thing.yvel = Math.max(thing.yvel - thing.FSM.unitsize / 64, -thing.maxvel);
            }

            // Deal with velocities and whether the player is resting on this
            thing.FSM.movePlatform(<any>thing);
        }

        /**
         * Actual movement Function for Things that float sideways (horizontally).
         * If the Thing has reached thing.begin or thing.end, it gradually switches
         * thing.xvel.
         * 
         * @param {Thing} thing
         * @remarks thing.maxvel is used as the maximum absolute speed horizontally
         * @remarks thing.begin and thing.end are used as the horizontal endpoints;
         *          .begin is the left and .end is the right (since begin <= end)
         */
        moveSliding(thing: IThingSliding): void {
            // If to the left of the endpoint:
            if (thing.FSM.MapScreener.left + thing.left <= thing.begin) {
                thing.xvel = Math.min(
                    thing.xvel + thing.FSM.unitsize / 64, thing.maxvel);
            } else if (thing.FSM.MapScreener.left + thing.right > thing.end) {
                // If to the right of the endpoint:
                thing.xvel = Math.max(
                    thing.xvel - thing.FSM.unitsize / 64, -thing.maxvel);
            }

            // Deal with velocities and whether the player is resting on this
            thing.FSM.movePlatform(<any>thing);
        }

        /**
         * Ensures thing.begin <= thing.end (so there won't be glitches pertaining
         * to them in functions like moveFloating and moveSliding
         * 
         * @param {Thing} thing
         */
        setMovementEndpoints(thing: IThingFloating | IThingSliding): void {
            if (thing.begin > thing.end) {
                var temp: number = thing.begin;
                thing.begin = thing.end;
                thing.end = temp;
            }

            thing.begin *= thing.FSM.unitsize;
            thing.end *= thing.FSM.unitsize;
        }

        /**
         * General movement Function for Platforms. Moves a Platform by its 
         * velocities, and checks for whether a Thing is resting on it (if so, 
         * the Thing is accordingly).
         * 
         * @param {Thing} thing
         */
        movePlatform(thing: IPlatform): void {
            thing.FSM.shiftHoriz(thing, thing.xvel);
            thing.FSM.shiftVert(thing, thing.yvel);

            // If the player is resting on this and this is alive, move the player
            if (thing === thing.FSM.player.resting && thing.FSM.player.alive) {
                thing.FSM.setBottom(thing.FSM.player, thing.top);
                thing.FSM.shiftHoriz(thing.FSM.player, thing.xvel);

                // If the player is too far to the right or left, stop that overlap
                if (thing.FSM.player.right > thing.FSM.MapScreener.width) {
                    thing.FSM.setRight(
                        thing.FSM.player,
                        thing.FSM.MapScreener.width);
                } else if (thing.FSM.player.left < 0) {
                    thing.FSM.setLeft(thing.FSM.player, 0);
                }
            }
        }

        /**
         * Movement Function for platforms that are in a PlatformGenerator. They
         * have the typical movePlatform applied to them, but if they reach the
         * bottom or top of the screen, they are shifted to the opposite side.
         * 
         * @param {Platform} thing
         */
        movePlatformSpawn(thing: IPlatform): void {
            if (thing.bottom < 0) {
                thing.FSM.setTop(thing, thing.FSM.MapScreener.bottomPlatformMax);
            } else if (
                thing.top > thing.FSM.MapScreener.bottomPlatformMax
                ) {
                thing.FSM.setBottom(thing, 0);
            } else {
                thing.FSM.movePlatform(thing);
                return;
            }

            if (
                thing.FSM.player
                && thing.FSM.player.resting === thing
                ) {
                thing.FSM.player.resting = undefined;
            }
        }

        /**
         * Movement Function for Platforms that fall whenever rested upon by a 
         * player. Being rested upon means the Platform falls; when it reaches a 
         * terminal velocity, it switches to moveFreeFalling forever.
         * 
         * @param {Platform} thing
         */
        moveFalling(thing: IPlatform): void {
            // If the player isn't resting on this thing (any more?), ignore it
            if (thing.FSM.player.resting !== thing) {
                // Since the player might have been on this thing but isn't anymore, 
                // set the yvel to 0 just in case
                thing.yvel = 0;
                return;
            }

            // Since the player is on this thing, start falling more
            thing.FSM.shiftVert(
                thing, thing.yvel += thing.FSM.unitsize / 8
                );
            thing.FSM.setBottom(thing.FSM.player, thing.top);

            // After a velocity threshold, start always falling
            if (
                thing.yvel >= (
                    thing.fallThresholdStart || thing.FSM.unitsize * 2.8
                    )
                ) {
                thing.freefall = true;
                thing.movement = thing.FSM.moveFreeFalling;
            }
        }

        /**
         * Movement Function for Platforms that have reached terminal velocity in
         * moveFalling and are now destined to die. The Platform will continue to
         * accelerate towards certain death until another velocity threshold,
         * and then switches to movePlatform to remain at that rate.
         * 
         * @param {Platform} thing
         */
        moveFreeFalling(thing: IPlatform): void {
            // Accelerate downwards, increasing the thing's y-velocity
            thing.yvel += thing.acceleration || thing.FSM.unitsize / 16;
            thing.FSM.shiftVert(thing, thing.yvel);

            // After a velocity threshold, stop accelerating
            if (thing.yvel >= (thing.fallThresholdEnd || thing.FSM.unitsize * 2)) {
                thing.movement = thing.FSM.movePlatform;
            }
        }

        /**
         * Movement Function for Platforms that are a part of a scale.  Nothing
         * happens if a Platform isn't being rested and doesn't have a y-velocity. 
         * Being rested upon means the y-velocity increases, and not being rested
         * means the y-velocity decreases: either moves the corresponding Platform
         * "partner" in the other vertical direction. When the Platform is too far
         * down (visually has no string left), they both fall.
         * 
         * @param {Platform} thing
         * @todo Implement this! See #146.
         */
        movePlatformScale(thing: IPlatform): void {
            // If the Player is resting on this, fall hard
            if (thing.FSM.player.resting === thing) {
                thing.yvel += thing.FSM.unitsize / 16;
            } else if (thing.yvel > 0) {
                // If this still has velocity from a player, stop or fall less
                if (!thing.partners) {
                    thing.yvel = 0;
                } else {
                    thing.yvel = Math.max(
                        thing.yvel - thing.FSM.unitsize / 16, 0
                        );
                }
            } else {
                // Not being rested upon or having a yvel means nothing happens
                return;
            }

            thing.tension += thing.yvel;
            thing.FSM.shiftVert(thing, thing.yvel);

            // The rest of the logic is for the platform's partner(s)
            if (!thing.partners) {
                return;
            }

            thing.partners.partnerPlatform.tension -= thing.yvel;

            // If the partner has fallen off, everybody falls!
            if (thing.partners.partnerPlatform.tension <= 0) {
                thing.FSM.scoreOn(1000, thing);
                thing.partners.partnerPlatform.yvel = thing.FSM.unitsize / 2;
                thing.collide = thing.partners.partnerPlatform.collide = (
                    thing.FSM.collideCharacterSolid);
                thing.movement = thing.partners.partnerPlatform.movement = (
                    thing.FSM.moveFreeFalling);
            }

            // The partner has yvel equal and opposite to this platform's
            thing.FSM.shiftVert(
                thing.partners.partnerPlatform,
                -thing.yvel);

            // This platform's string grows with its yvel
            thing.FSM.setHeight(
                thing.partners.ownString,
                thing.partners.ownString.height + thing.yvel / thing.FSM.unitsize);

            // The partner's string shrinks while this platform's string grows
            thing.FSM.setHeight(
                thing.partners.partnerString,
                Math.max(
                    thing.partners.partnerString.height - (
                        thing.yvel / thing.FSM.unitsize
                        ),
                    0
                    )
                );
        }

        /**
         * Movement Function for Vines. They are constantly growing upward, until
         * some trigger (generally from animateEmergeVine) sets movement to 
         * undefined. If there is an attached Thing, it is moved up at the same rate
         * as the Vine.
         * 
         * @param {Vine} thing
         */
        moveVine(thing: IVine): void {
            thing.FSM.increaseHeight(thing, thing.speed);
            thing.FSM.updateSize(thing);

            if (thing.attachedSolid) {
                thing.FSM.setBottom(thing, thing.attachedSolid.top);
            }

            if (thing.attachedCharacter) {
                thing.FSM.shiftVert(thing.attachedCharacter, -thing.speed);
            }
        }

        /**
         * Movement Function for Springboards that are "pushing up" during or after
         * being hit by a player. The Springboard changes its height based on its
         * tension. If the player is still on it, then the player is given extra
         * vertical velocity and taken off.
         * 
         * @param {Springboard} thing
         */
        moveSpringboardUp(thing: ISpringboard): void {
            var player: IPlayer = thing.FSM.player;

            thing.FSM.reduceHeight(thing, -thing.tension, true);
            thing.tension *= 2;

            // If the spring height is past the normal, it's done moving
            if (thing.height > thing.heightNormal) {
                thing.FSM.reduceHeight(
                    thing,
                    (thing.height - thing.heightNormal) * thing.FSM.unitsize
                    );
                if (thing === player.spring) {
                    player.yvel = Math.max(
                        thing.FSM.unitsize * -2,
                        thing.tensionSave * -.98
                        );
                    player.resting = player.spring = undefined;
                    player.movement = FullScreenMario.prototype.movePlayer;
                }
                thing.tension = 0;
                thing.movement = undefined;
            } else {
                thing.FSM.setBottom(player, thing.top);
            }

            if (thing === player.spring) {
                if (!thing.FSM.isThingTouchingThing(player, thing)) {
                    player.spring = undefined;
                    player.movement = FullScreenMario.prototype.movePlayer;
                }
            }
        }

        /**
         * Movement Function for Shells. This actually does nothing for moving 
         * Shells (since they only interact unusually on collision). For Shells with
         * no x-velocity, a counting variable is increased. Once it reaches 350, the
         * shell is "peeking" visually; when it reaches 490, the Shell spawns back
         * into its original spawner (typically Koopa or Beetle).
         * 
         * @param {Shell} thing
         */
        moveShell(thing: IShell): void {
            if (thing.xvel !== 0) {
                return;
            }

            thing.counting += 1;

            if (thing.counting === 350) {
                thing.peeking = 1;
                thing.height += thing.FSM.unitsize / 8;
                thing.FSM.addClass(thing, "peeking");
                thing.FSM.updateSize(thing);
            } else if (thing.counting === 455) {
                thing.peeking = 2;
            } else if (thing.counting === 490) {
                thing.spawnSettings = {
                    "smart": thing.smart
                };
                thing.FSM.killSpawn(thing);
            }
        }

        /**
         * Movement Function for Piranhas. These constantly change their height 
         * except when they reach 0 or full height (alternating direction), at which
         * point they switch to movePiranhaLatent to wait to move in the opposite
         * direction.
         * 
         * @param {Piranha} thing
         */
        movePiranha(thing: IPiranha): void {
            var bottom: number = thing.bottom,
                height: number = thing.height + thing.direction,
                atEnd: boolean = false;

            if (thing.resting && !thing.FSM.isThingAlive(thing.resting)) {
                bottom = thing.top + (
                    thing.constructor.prototype.height * thing.FSM.unitsize
                    );
                height = Infinity;
                thing.resting = undefined;
            }

            if (height <= 0) {
                height = thing.height = 0;
                atEnd = true;
            } else if (height >= thing.constructor.prototype.height) {
                height = thing.height = thing.constructor.prototype.height;
                atEnd = true;
            }

            thing.FSM.setHeight(thing, height, true, true);
            thing.FSM.setBottom(thing, bottom);

            if (atEnd) {
                thing.counter = 0;
                thing.movement = thing.FSM.movePiranhaLatent;
            }
        }

        /**
         * Movement Function for Piranhas that are not changing size. They wait 
         * until a counter reaches a point (and then, if their height is 0, for the
         * player to go away) to switch back to movePiranha.
         * 
         * @param {Piranha} thing
         */
        movePiranhaLatent(thing: IPiranha): void {
            var playerX: number = thing.FSM.getMidX(thing.FSM.player);

            if (
                thing.counter >= thing.countermax
                && (
                    thing.height > 0
                    || playerX < thing.left - thing.FSM.unitsize * 8
                    || playerX > thing.right + thing.FSM.unitsize * 8
                    )
                ) {
                thing.movement = undefined;
                thing.direction *= -1;

                thing.FSM.TimeHandler.addEvent(
                    function (): void {
                        thing.movement = thing.FSM.movePiranha;
                    },
                    7);
            } else {
                thing.counter += 1;
            }
        }

        /**
         * Movement Function for the Bubbles that come out of a player's mouth
         * underwater. They die when they reach a top threshold of unitsize * 16.
         * 
         * @param {Bubble} thing
         */
        moveBubble(thing: IThing): void {
            if (
                thing.top < (
                    thing.FSM.MapScreener.top
                    + thing.FSM.unitsize * 16
                    )
                ) {
                thing.FSM.killNormal(thing);
            }
        }

        /**
         * Movement Function for typical CheepCheeps, which are underwater. They
         * move according to their native velocities except that they cannot travel
         * above the unitsize * 16 top threshold.
         * 
         * @param {CheepCheep} thing
         */
        moveCheepCheep(thing: IThing): void {
            if (thing.top < thing.FSM.unitsize * 16) {
                thing.FSM.setTop(thing, thing.FSM.unitsize * 16);
                thing.yvel *= -1;
                return;
            }
        }

        /**
         * Movement Function for flying CheepCheeps, like in bridge areas. They 
         * lose a movement Function (and therefore just fall) at a unitsize * 28 top
         * threshold.
         * 
         * @param {CheepCheep} thing
         */
        moveCheepCheepFlying(thing: IThing): void {
            if (thing.top < thing.FSM.unitsize * 28) {
                thing.movement = undefined;
                thing.nofall = false;
            }
        }

        /**
         * Movement Function for Bloopers. These switch between "squeezing" (moving
         * down) and moving up ("unsqueezing"). They always try to unsqueeze if the 
         * player is above them.
         * 
         * @param {Blooper} thing
         */
        moveBlooper(thing: IBlooper): void {
            // If the player is dead, just drift aimlessly
            if (!thing.FSM.isThingAlive(thing.FSM.player)) {
                thing.xvel = thing.FSM.unitsize / -4;
                thing.yvel = 0;
                thing.movement = undefined;
                return;
            }

            switch (thing.counter) {
                case 56:
                    thing.squeeze = 1;
                    thing.counter += 1;
                    break;
                case 63:
                    thing.FSM.moveBlooperSqueezing(thing);
                    break;
                default:
                    thing.counter += 1;
                    if (thing.top < thing.FSM.unitsize * 18) {
                        thing.FSM.moveBlooperSqueezing(thing);
                    }
                    break;
            }

            if (thing.squeeze) {
                thing.yvel = Math.max(thing.yvel + .021, .7); // going down
            } else {
                thing.yvel = Math.min(thing.yvel - .035, -.7); // going up
            }

            if (thing.top > thing.FSM.unitsize * 16) {
                thing.FSM.shiftVert(thing, thing.yvel, true);
            }

            if (!thing.squeeze) {
                if (
                    thing.FSM.player.left
                    > thing.right + thing.FSM.unitsize * 8
                    ) {
                    // Go to the right
                    thing.xvel = Math.min(
                        thing.speed, thing.xvel + thing.FSM.unitsize / 32
                        );
                } else if (
                    thing.FSM.player.right
                    < thing.left - thing.FSM.unitsize * 8
                    ) {
                    // Go to the left
                    thing.xvel = Math.max(
                        -thing.speed,
                        thing.xvel - thing.FSM.unitsize / 32
                        );
                }
            }
        }

        /**
         * Additional movement Function for Bloopers that are "squeezing". Squeezing
         * Bloopers travel downard at a gradual pace until they reach either the
         * player's bottom or a threshold of unitsize * 90.
         * 
         * @param {Blooper} thing
         */
        moveBlooperSqueezing(thing: IBlooper): void {
            if (thing.squeeze !== 2) {
                thing.squeeze = 2;
                thing.FSM.addClass(thing, "squeeze");
                thing.FSM.setHeight(thing, 10, true, true);
            }

            if (thing.squeeze < 7) {
                thing.xvel /= 1.4;
            } else if (thing.squeeze === 7) {
                thing.xvel = 0;
            }

            thing.squeeze += 1;

            if (
                thing.top > thing.FSM.player.bottom
                || thing.bottom > thing.FSM.unitsize * 91
                ) {
                thing.FSM.animateBlooperUnsqueezing(thing);
            }
        }

        /**
         * Movement Function for Podoboos that is only used when they are falling.
         * Podoboo animations trigger this when they reach a certain height, and
         * use this to determine when they should stop accelerating downward, which
         * is their starting location.
         * 
         * @param {Podoboo} thing
         */
        movePodobooFalling(thing: IPodoboo): void {
            if (thing.top >= thing.starty) {
                thing.yvel = 0;
                thing.movement = undefined;
                thing.FSM.unflipVert(thing);
                thing.FSM.setTop(thing, thing.starty);
                return;
            }

            if (thing.yvel >= thing.speed) {
                thing.yvel = thing.speed;
                return;
            }

            if (!thing.flipVert && thing.yvel > 0) {
                thing.FSM.flipVert(thing);
            }

            thing.yvel += thing.acceleration;
        }

        /**
         * Movement Function for Lakitus that have finished their moveLakituInitial
         * run. This is similar to movePacing in that it makes the Lakitu pace to 
         * left and right of the player, and moves with the player rather than the
         * scrolling window.
         * 
         * @param {Lakitu} thing
         */
        moveLakitu(thing: ILakitu): void {
            var player: IPlayer = thing.FSM.player;

            // If the player is moving quickly to the right, move in front and stay there
            if (
                player.xvel > thing.FSM.unitsize / 8
                && player.left > thing.FSM.MapScreener.width / 2
                ) {
                if (thing.left < player.right + thing.FSM.unitsize * 16) {
                    // slide to xloc
                    thing.FSM.slideToX(
                        thing,
                        player.right + player.xvel + thing.FSM.unitsize * 32,
                        player.maxspeed * 1.4
                        );
                    thing.counter = 0;
                }
            } else {
                thing.counter += .007;
                thing.FSM.slideToX(
                    thing,
                    player.left + player.xvel + Math.sin(Math.PI * thing.counter) * 117,
                    player.maxspeed * .7
                    );
            }
        }

        /**
         * Initial entry movement Function for Lakitus. They enter by sliding across
         * the top of the screen until they reach the player, and then switch to
         * their standard moveLakitu movement.
         * 
         * @param {Lakitu} thing
         */
        moveLakituInitial(thing: ILakitu): void {
            if (thing.right < thing.FSM.player.left) {
                thing.counter = 0;
                thing.movement = thing.FSM.moveLakitu;
                thing.movement(thing);
                return;
            }

            thing.FSM.shiftHoriz(thing, -thing.FSM.unitsize);
        }

        /**
         * Alternate movement Function for Lakitus. This is used when the player
         * reaches the ending flagpole in a level and the Lakitu just flies to the 
         * left.
         * 
         * @param {Lakitu} thing
         */
        moveLakituFleeing(thing: ILakitu): void {
            thing.FSM.shiftHoriz(thing, -thing.FSM.unitsize);
        }

        /**
         * Movement Function for Coins that have been animated. They move based on
         * their yvel, and if they have a parent, die when they go below the parent.
         * 
         * @param {Coin} thing
         * @param {Solid} [parent]
         */
        moveCoinEmerge(thing: ICoin, parent?: ISolid): void {
            thing.FSM.shiftVert(thing, thing.yvel);

            if (parent && thing.bottom >= thing.blockparent.bottom) {
                thing.FSM.killNormal(thing);
            }
        }

        /**
         * Movement Function for the player. It reacts to almost all actions that 
         * to be done, but is horribly written so that is all the documentation you
         * get here. Sorry! Sections are labeled on the inside.
         * 
         * @param {Player} thing
         */
        movePlayer(thing: IPlayer): void {
            var decel: number = 0; // (how much extra to decrease running)

            // Not jumping
            if (!thing.keys.up) {
                thing.keys.jump = false;
            } else if (
                // Jumping
                thing.keys.jump
                && (thing.yvel <= 0 || thing.FSM.MapScreener.underwater)
                ) {
                if (thing.FSM.MapScreener.underwater) {
                    thing.FSM.animatePlayerPaddling(thing);
                    thing.FSM.removeClass(thing, "running");
                }

                if (thing.resting) {
                    if (thing.resting.xvel) {
                        thing.xvel += thing.resting.xvel;
                    }
                    thing.resting = undefined;
                } else {
                    // Jumping, not resting
                    if (!thing.jumping && !thing.FSM.MapScreener.underwater) {
                        thing.FSM.switchClass(thing, "running skidding", "jumping");
                    }
                    thing.jumping = true;

                    if (thing.power > 1 && thing.crouching) {
                        thing.FSM.removeClass(thing, "jumping");
                    }
                }
                if (!thing.FSM.MapScreener.underwater) {
                    thing.keys.jumplev += 1;
                    var dy: number = FullScreenMario.unitsize / (Math.pow(
                        thing.keys.jumplev,
                        thing.FSM.MapScreener.jumpmod - .0014 * thing.xvel));
                    thing.yvel = Math.max(thing.yvel - dy, thing.FSM.MapScreener.maxyvelinv);
                }
            }

            // Crouching
            if (thing.keys.crouch && !thing.crouching && thing.resting) {
                if (thing.power > 1) {
                    thing.crouching = true;
                    thing.FSM.removeClass(thing, "running");
                    thing.FSM.addClass(thing, "crouching");
                    thing.FSM.setHeight(thing, 11, true, true);
                    thing.height = 11;
                    thing.tolyOld = thing.toly;
                    thing.toly = thing.FSM.unitsize * 4;
                    thing.FSM.updateBottom(thing, 0);
                    thing.FSM.updateSize(thing);
                }
                // Pipe movement
                if (thing.resting.actionTop) {
                    thing.FSM.ModAttacher.fireEvent("onPlayerActionTop", thing, thing.resting);
                    thing.resting.actionTop(thing, thing.resting);
                }
            }

            // Running
            // If a button is pressed, hold/increase speed
            if (thing.keys.run !== 0 && !thing.crouching) {
                var dir: number = thing.keys.run,
                    // No sprinting underwater
                    sprinting: number = Number(thing.keys.sprint && !thing.FSM.MapScreener.underwater) || 0,
                    adder: number = dir * (.098 * (Number(sprinting) + 1));

                // Reduce the speed, both by subtracting and dividing a little
                thing.xvel += adder || 0;
                thing.xvel *= .98;
                decel = .0007;

                // If you're accelerating in the opposite direction from your current velocity, that's a skid
                if ((thing.keys.run > 0) === thing.moveleft) {
                    if (!thing.skidding) {
                        thing.FSM.addClass(thing, "skidding");
                        thing.skidding = true;
                    }
                } else if (thing.skidding) {
                    // Not accelerating: make sure you're not skidding
                    thing.FSM.removeClass(thing, "skidding");
                    thing.skidding = false;
                }
            } else {
                // Otherwise slow down a bit
                thing.xvel *= .98;
                decel = .035;
            }

            if (thing.xvel > decel) {
                thing.xvel -= decel;
            } else if (thing.xvel < -decel) {
                thing.xvel += decel;
            } else if (thing.xvel !== 0) {
                thing.xvel = 0;
                if (!thing.FSM.MapScreener.nokeys && thing.keys.run === 0) {
                    if (thing.keys.leftDown) {
                        thing.keys.run = -1;
                    } else if (thing.keys.rightDown) {
                        thing.keys.run = 1;
                    }
                }
            }

            // Movement mods
            // Slowing down
            if (Math.abs(thing.xvel) < .14) {
                if (thing.running) {
                    thing.running = false;
                    if (thing.power === 1) {
                        thing.FSM.setPlayerSizeSmall(thing);
                    }
                    thing.FSM.removeClasses(thing, "running skidding one two three");
                    thing.FSM.addClass(thing, "still");
                    thing.FSM.TimeHandler.cancelClassCycle(thing, "running");
                }
            } else if (!thing.running) {
                // Not moving slowly
                thing.running = true;
                thing.FSM.animatePlayerRunningCycle(thing);
                if (thing.power === 1) {
                    thing.FSM.setPlayerSizeSmall(thing);
                }
            }
            if (thing.xvel > 0) {
                thing.xvel = Math.min(thing.xvel, thing.maxspeed);
                if (thing.moveleft && (thing.resting || thing.FSM.MapScreener.underwater)) {
                    thing.FSM.unflipHoriz(thing);
                    thing.moveleft = false;
                }
            } else if (thing.xvel < 0) {
                thing.xvel = Math.max(thing.xvel, thing.maxspeed * -1);
                if (!thing.moveleft && (thing.resting || thing.FSM.MapScreener.underwater)) {
                    thing.moveleft = true;
                    thing.FSM.flipHoriz(thing);
                }
            }

            // Resting stops a bunch of other stuff
            if (thing.resting) {
                // Hopping
                if (thing.hopping) {
                    thing.hopping = false;
                    thing.FSM.removeClass(thing, "hopping");
                    if (thing.xvel) {
                        thing.FSM.addClass(thing, "running");
                    }
                }
                // Jumping
                thing.keys.jumplev = thing.yvel = thing.jumpcount = 0;
                if (thing.jumping) {
                    thing.jumping = false;
                    thing.FSM.removeClass(thing, "jumping");
                    if (thing.power === 1) {
                        thing.FSM.setPlayerSizeSmall(thing);
                    }
                    thing.FSM.addClass(thing, Math.abs(thing.xvel) < .14 ? "still" : "running");
                }
                // Paddling
                if (thing.paddling) {
                    thing.paddling = thing.swimming = false;
                    thing.FSM.TimeHandler.cancelClassCycle(thing, "paddling");
                    thing.FSM.removeClasses(thing, "paddling swim1 swim2");
                    thing.FSM.addClass(thing, "running");
                }
            }
        }

        /**
         * Alternate movement Function for players attached to a Vine. They may 
         * climb up or down the Vine, or jump off. 
         * 
         * @param {Player} thing
         */
        movePlayerVine(thing: IPlayer): void {
            var attachedSolid: ISolid = thing.attachedSolid,
                animatedClimbing: boolean;

            if (!attachedSolid) {
                thing.movement = thing.FSM.movePlayer;
                return;
            }

            if (thing.bottom < thing.attachedSolid.top) {
                thing.FSM.unattachPlayer(thing, thing.attachedSolid);
                return;
            }

            // Running away from the vine means dropping off
            if (thing.keys.run !== 0 && thing.keys.run === thing.attachedDirection) {
                // Leaving to the left
                if (thing.attachedDirection === -1) {
                    thing.FSM.setRight(thing, attachedSolid.left - thing.FSM.unitsize);
                } else if (thing.attachedDirection === 1) {
                    // Leaving to the right
                    thing.FSM.setLeft(thing, attachedSolid.right + thing.FSM.unitsize);
                }

                thing.FSM.unattachPlayer(thing, attachedSolid);
                return;
            }

            // If the player is moving up, simply move up
            if (thing.keys.up) {
                animatedClimbing = true;
                thing.FSM.shiftVert(thing, thing.FSM.unitsize / -4);
            } else if (thing.keys.crouch) {
                // If the thing is moving down, move down and check for unattachment
                animatedClimbing = true;
                thing.FSM.shiftVert(thing, thing.FSM.unitsize / 2);
                if (thing.top > attachedSolid.bottom) {
                    thing.FSM.unattachPlayer(thing, thing.attachedSolid);
                }
                return;
            } else {
                animatedClimbing = false;
            }

            if (animatedClimbing && !thing.animatedClimbing) {
                thing.FSM.addClass(thing, "animated");
            } else if (!animatedClimbing && thing.animatedClimbing) {
                thing.FSM.removeClass(thing, "animated");
            }

            thing.animatedClimbing = animatedClimbing;

            if (thing.bottom < thing.FSM.MapScreener.top - thing.FSM.unitsize * 4) {
                thing.FSM.setLocation(thing.attachedSolid.transport);
            }
        }

        /**
         * Movement Function for players pressing down onto a Springboard. This does
         * basically nothing except check for when the player is off the spring or
         * the spring is fully contracted. The former restores the player's movement
         * and the latter clears it (to be restored in moveSpringboardUp).
         * 
         * @param {Player} thing
         */
        movePlayerSpringboardDown(thing: IPlayer): void {
            var other: ISpringboard = thing.spring;

            // If the player has moved off the spring, get outta here
            if (!thing.FSM.isThingTouchingThing(thing, other)) {
                thing.movement = thing.FSM.movePlayer;
                other.movement = thing.FSM.moveSpringboardUp;
                thing.spring = undefined;
                return;
            }

            // If the spring is fully contracted, go back up
            if (
                other.height < thing.FSM.unitsize * 2.5
                || other.tension < thing.FSM.unitsize / 32
                ) {
                thing.movement = undefined;
                other.movement = thing.FSM.moveSpringboardUp;
                return;
            }

            // Make sure it's hard to slide off
            if (
                thing.left < other.left + thing.FSM.unitsize * 2
                || thing.right > other.right - thing.FSM.unitsize * 2
                ) {
                thing.xvel /= 1.4;
            }

            thing.FSM.reduceHeight(other, other.tension, true);
            other.tension /= 2;
            thing.FSM.setBottom(thing, other.top);
            thing.FSM.updateSize(other);
        }


        /* Animations
        */

        /**
         * Animates a solid that has just had its bottom "bumped" by a player. It
         * moves with a dx that is initially negative (up) and increases (to down).
         * 
         * @param {Solid} thing
         */
        animateSolidBump(thing: ISolid): void {
            var dx: number = -3;

            thing.FSM.TimeHandler.addEventInterval(
                function (thing: ISolid): boolean {
                    thing.FSM.shiftVert(thing, dx);
                    dx += .5;
                    if (dx === 3.5) {
                        thing.up = undefined;
                        return true;
                    }
                    return false;
                },
                1,
                Infinity,
                thing);
        }

        /**
         * Animates a Block to switch from unused to used.
         * 
         * @param {Block} thing
         */
        animateBlockBecomesUsed(thing: IBlock): void {
            thing.used = true;
            thing.FSM.switchClass(thing, "unused", "used");
        }

        /**
         * Animates a solid to have its contents emerge. A new Thing based on the 
         * contents is spawned directly on top of (visually behind) the solid, and
         * has its animate callback triggered.
         * 
         * @param {Solid} thing
         * @param {Player} other
         * @remarks If the contents are "Mushroom" and a large player hits the 
         *          solid, they turn into "FireFlower".
         * @remarks For the level editor, if thing.contents is false, the prototype
         *          is tried (so false becomes Coin in Blocks).
         */
        animateSolidContents(thing: IBrick | IBlock, other: IPlayer): ICharacter {
            var output: ICharacter;

            if (
                other
                && other.player
                && other.power > 1
                && thing.contents === "Mushroom"
                ) {
                thing.contents = "FireFlower";
            }

            output = <ICharacter>thing.FSM.addThing(
                thing.contents || thing.constructor.prototype.contents);
            thing.FSM.setMidXObj(output, thing);
            thing.FSM.setTop(output, thing.top);
            output.blockparent = thing;
            output.animate(output, thing);

            return output;
        }

        /**
         * Animates a Brick turning into four rotating shards flying out of it. The
         * shards have an initial x- and y-velocities, and die after 70 steps.
         * 
         * @param {Brick} thing
         */
        animateBrickShards(thing: IBrick): void {
            var unitsize: number = thing.FSM.unitsize,
                shard: IBrickShard,
                left: number,
                top: number,
                i: number;

            for (i = 0; i < 4; i += 1) {
                left = thing.left + Number(i < 2) * thing.width * unitsize - unitsize * 2;
                top = thing.top + (i % 2) * thing.height * unitsize - unitsize * 2;

                shard = <IBrickShard>thing.FSM.addThing("BrickShard", left, top);
                shard.xvel = shard.speed = unitsize / 2 - unitsize * Number(i > 1);
                shard.yvel = unitsize * -1.4 + i % 2;

                thing.FSM.TimeHandler.addEvent(
                    thing.FSM.killNormal, 70, shard);
            }
        }

        /**
         * Standard animation Function for Things emerging from a solid as contents.
         * They start at inside the solid, slowly move up, then moveSimple until 
         * they're off the solid, at which point they revert to their normal 
         * movement.
         * 
         * @param {Character} thing
         * @param {Solid} other
         */
        animateEmerge(thing: ICharacter, other: ISolid): void {
            thing.nomove = thing.nocollide = thing.nofall = thing.alive = true;

            thing.FSM.flipHoriz(thing);
            thing.FSM.AudioPlayer.play("Powerup Appears");
            thing.FSM.arraySwitch(
                thing,
                <IThing[]>thing.FSM.GroupHolder.getGroup("Character"),
                <IThing[]>thing.FSM.GroupHolder.getGroup("Scenery"));

            thing.FSM.TimeHandler.addEventInterval(
                function (): boolean {
                    thing.FSM.shiftVert(thing, thing.FSM.unitsize / -8);

                    // Only stop once the bottom has reached the solid's top
                    if (thing.bottom > other.top) {
                        return false;
                    }

                    thing.FSM.setBottom(thing, other.top);
                    thing.FSM.GroupHolder.switchObjectGroup(
                        thing, "Scenery", "Character");
                    thing.nomove = thing.nocollide = thing.nofall = thing.moveleft = false;

                    if (thing.emergeOut) {
                        thing.emergeOut(thing, other);
                    }

                    // Wait for movement until moveSimple moves this off the solid
                    if (thing.movement) {
                        thing.movementOld = thing.movement;
                        thing.movement = thing.FSM.moveSimple;

                        thing.FSM.TimeHandler.addEventInterval(
                            function (): boolean {
                                if (thing.resting === other) {
                                    return false;
                                }

                                thing.FSM.TimeHandler.addEvent(
                                    function (): void {
                                        thing.movement = thing.movementOld;
                                    },
                                    1);

                                return true;
                            },
                            1,
                            Infinity);
                    }

                    return true;
                },
                1,
                Infinity);
        }

        /**
         * Animation Function for Coins emerging from (or being hit by) a solid. The
         * Coin switches to the Scenery group, rotates between animation classes, 
         * moves up then down then dies, plays the "Coin" sound, and increaes the
         * "coins" and "score" statistics.
         * 
         * @param {Coin} thing
         * @param {Solid} other
         */
        animateEmergeCoin(thing: ICoin, other: ISolid): void {
            thing.nocollide = thing.alive = thing.nofall = true;
            thing.yvel -= thing.FSM.unitsize;

            thing.FSM.switchClass(thing, "still", "anim");
            thing.FSM.GroupHolder.switchObjectGroup(thing, "Character", "Scenery");

            thing.FSM.AudioPlayer.play("Coin");
            thing.FSM.ItemsHolder.increase("coins", 1);
            thing.FSM.ItemsHolder.increase("score", 200);

            thing.FSM.TimeHandler.cancelClassCycle(thing, "0");
            thing.FSM.TimeHandler.addClassCycle(
                thing,
                [
                    "anim1", "anim2", "anim3", "anim4", "anim3", "anim2"
                ],
                "0",
                5);

            thing.FSM.TimeHandler.addEventInterval(
                function (): boolean {
                    thing.FSM.moveCoinEmerge(thing, other);
                    return !thing.FSM.isThingAlive(thing);
                },
                1,
                Infinity);

            thing.FSM.TimeHandler.addEvent(
                function (): void {
                    thing.FSM.killNormal(thing);
                },
                49);

            thing.FSM.TimeHandler.addEvent(
                function (): void {
                    thing.yvel *= -1;
                },
                25);
        }

        /**
         * Animation Function for a Vine emerging from a solid. It continues to grow
         * as normal via moveVine for 700 steps, then has its movement erased to 
         * stop.
         * 
         * @param {Vine} thing
         * @param {Solid} solid
         */
        animateEmergeVine(thing: IVine, solid: ISolid): void {
            // This allows the thing's movement to keep it on the solid
            thing.attachedSolid = solid;

            thing.FSM.setHeight(thing, 0);
            thing.FSM.AudioPlayer.play("Vine Emerging");
            thing.FSM.TimeHandler.addEvent(
                function (): void {
                    thing.nocollide = false;
                },
                14);

            thing.FSM.TimeHandler.addEvent(
                function (): void {
                    thing.movement = undefined;
                },
                700);
        }

        /**
         * Animates a "flicker" effect on a Thing by repeatedly toggling its hidden
         * flag for a little while.
         * 
         * @param {Thing} thing
         * @param {Number} [cleartime]   How long to wait to stop the effect (by 
         *                               default, 49).
         * @param {Number} [interval]   How many steps between hidden toggles (by
         *                              default, 2).
         */
        animateFlicker(thing: IThing, cleartime?: number, interval?: number): void {
            cleartime = Math.round(cleartime) || 49;
            interval = Math.round(interval) || 2;

            thing.flickering = true;

            thing.FSM.TimeHandler.addEventInterval(
                function (): void {
                    thing.hidden = !thing.hidden;
                    thing.FSM.PixelDrawer.setThingSprite(thing);
                },
                interval,
                cleartime);

            thing.FSM.TimeHandler.addEvent(
                function (): void {
                    thing.flickering = thing.hidden = false;
                    thing.FSM.PixelDrawer.setThingSprite(thing);
                },
                cleartime * interval + 1);
        }

        /**
         * Animate Function for a HammerBro to throw a hammer. The HammerBro 
         * switches to the "throwing" class, waits and throws a few repeats, then
         * goes back to normal.
         * 
         * @param {HammerBro} thing
         * @param {Number} count   How many times left there are to throw a hammer.
         *                         If equal to 3, a hammer will not be thrown (to
         *                         mimic the pause in the original game).
         * @remarks This could probably be re-written.
         */
        animateThrowingHammer(thing: IHammerBro, count: number): boolean {
            if (
                !thing.FSM.isThingAlive(thing)
                || !thing.FSM.isThingAlive(thing.FSM.player)
                || thing.right < thing.FSM.unitsize * -32
                ) {
                return true;
            }

            if (count !== 3) {
                thing.FSM.switchClass(thing, "thrown", "throwing");
            }

            thing.FSM.TimeHandler.addEvent(
                function (): boolean {
                    if (!thing.FSM.isThingAlive(thing)) {
                        return false;
                    }

                    // Throw the hammer...
                    if (count !== 3) {
                        thing.FSM.switchClass(thing, "throwing", "thrown");
                        thing.FSM.addThing(
                            ["Hammer", {
                                "xvel": thing.lookleft
                                    ? thing.FSM.unitsize / -1.4
                                    : thing.FSM.unitsize / 1.4,
                                "yvel": thing.FSM.unitsize * -1.4,
                                "gravity": thing.FSM.MapScreener.gravity / 2.1
                            }],
                            thing.left - thing.FSM.unitsize * 2,
                            thing.top - thing.FSM.unitsize * 2
                            );
                    }

                    // ...and go again
                    if (count > 0) {
                        thing.FSM.TimeHandler.addEvent(
                            thing.FSM.animateThrowingHammer,
                            7, thing, count - 1
                            );
                    } else {
                        thing.FSM.TimeHandler.addEvent(
                            thing.FSM.animateThrowingHammer,
                            70, thing, 7
                            );
                        thing.FSM.removeClass(thing, "thrown");
                    }
                },
                14);

            return false;
        }

        /**
         * Animation Function for when Bowser jumps. This will only trigger if he is
         * facing left and a player exists. If either Bowser or the player die, it
         * is cancelled. He is given a negative yvel to jump, and the nocollidesolid
         * flag is enabled as long as he is rising.
         * 
         * @param {Bowser} thing
         */
        animateBowserJump(thing: IBowser): boolean {
            if (!thing.lookleft || !thing.FSM.player) {
                return false;
            }

            if (
                !thing.FSM.isThingAlive(thing)
                || !thing.FSM.isThingAlive(thing.FSM.player)
                ) {
                return true;
            }

            thing.resting = undefined;
            thing.yvel = thing.FSM.unitsize * -1.4;

            // If there is a platform, don't bump into it
            thing.nocollidesolid = true;
            thing.FSM.TimeHandler.addEventInterval(
                function (): boolean {
                    if (thing.dead || thing.yvel > thing.FSM.unitsize) {
                        thing.nocollidesolid = false;
                        return true;
                    }
                    return false;
                },
                3,
                Infinity);

            return false;
        }

        /**
         * Animation Function for when Bowser fires. This will only trigger if he is
         * facing left and a player exists. If either Bowser or the player die, it
         * is cancelled. His mouth is closed and an animateBowserFireOpen call is
         * scheduled to complete the animation.
         * 
         * @param {Bowser} thing
         */
        animateBowserFire(thing: IBowser): boolean {
            if (!thing.lookleft || !thing.lookleft || !thing.FSM.player) {
                return false;
            }

            if (
                !thing.FSM.isThingAlive(thing)
                || !thing.FSM.isThingAlive(thing.FSM.player)
                ) {
                return true;
            }

            // Close the mouth
            thing.FSM.addClass(thing, "firing");
            thing.FSM.AudioPlayer.playLocal("Bowser Fires", thing.left);

            // After a bit, re-open and fire
            thing.FSM.TimeHandler.addEvent(thing.FSM.animateBowserFireOpen, 14, thing);

            return false;
        }

        /**
         * Animation Function for when Bowser actually fires. A BowserFire Thing is
         * placed at his mouth, given a (rounded to unitsize * 8) destination y, and
         * sent firing to the player.
         * 
         * @param {Bowser} thing
         */
        animateBowserFireOpen(thing: IBowser): boolean {
            var unitsize: number = thing.FSM.unitsize,
                ylev: number = Math.max(
                    -thing.height * unitsize,
                    Math.round(thing.FSM.player.bottom / (unitsize * 8))
                    * unitsize * 8);

            if (!thing.FSM.isThingAlive(thing)) {
                return true;
            }

            thing.FSM.removeClass(thing, "firing");
            thing.FSM.addThing(
                ["BowserFire", {
                    "ylev": ylev
                }],
                thing.left - thing.FSM.unitsize * 8,
                thing.top + thing.FSM.unitsize * 4
                );

            return false;
        }

        /**
         * Animation Function for when Bowser throws a Hammer. It's similar to a
         * HammerBro, but the hammer appears on top of Bowser for a few steps
         * before being thrown in the direction Bowser is facing (though it will
         * only be added if facing left).
         * 
         * @param {Bowser} thing
         */
        animateBowserThrow(thing: IBowser): boolean {
            if (!thing.lookleft || !thing.FSM.isThingAlive(thing)) {
                return;
            }

            var hammer: IThing = <IThing>thing.FSM.addThing(
                "Hammer",
                thing.left + thing.FSM.unitsize * 2,
                thing.top - thing.FSM.unitsize * 2);

            thing.FSM.TimeHandler.addEventInterval(
                function (): boolean {
                    if (!thing.FSM.isThingAlive(thing)) {
                        thing.FSM.killNormal(hammer);
                        return true;
                    }

                    thing.FSM.setTop(
                        hammer, thing.top - thing.FSM.unitsize * 2
                        );
                    if (thing.lookleft) {
                        thing.FSM.setLeft(
                            hammer,
                            thing.left + thing.FSM.unitsize * 2
                            );
                    } else {
                        thing.FSM.setLeft(
                            hammer,
                            thing.right - thing.FSM.unitsize * 2
                            );
                    }

                    return true;
                },
                1,
                14);

            thing.FSM.TimeHandler.addEvent(
                function (): void {
                    hammer.xvel = thing.FSM.unitsize * 1.17;
                    hammer.yvel = thing.FSM.unitsize * -2.1;
                    // hammer.gravity = thing.FSM.MapScreener.gravity / 1.4;
                    if (thing.lookleft) {
                        hammer.xvel *= -1;
                    }
                },
                14);

            return false;
        }

        /**
         * Animation Function for when Bowser freezes upon the player hitting a 
         * CastleAxe. Velocity and movement are paused, then nofall is disabled 
         * after 70 steps.
         * 
         * @param {Bowser} thing
         */
        animateBowserFreeze(thing: IBowser): void {
            thing.nofall = true;
            thing.nothrow = true;
            thing.movement = undefined;
            thing.dead = true;
            thing.FSM.thingPauseVelocity(thing);

            thing.FSM.TimeHandler.addEvent(
                function (): void {
                    thing.nofall = false;
                },
                70);
        }

        /**
         * Animation Function for a standard jump, such as what HammerBros do. The
         * jump may be in either up or down, chosen at random by the NumberMaker.
         * Steps are taken to ensure the Thing does not collide at improper points
         * during the jump.
         * 
         * @param {Thing} thing
         */
        animateJump(thing: IHammerBro): boolean {
            // Finish
            if (!thing.FSM.isThingAlive(thing) || !thing.FSM.isThingAlive(thing.FSM.player)) {
                return true;
            }

            // Skip
            if (!thing.resting) {
                return false;
            }

            // Jump up?
            if (
                thing.FSM.MapScreener.floor - (
                    thing.bottom / thing.FSM.unitsize
                    ) >= 30
                && thing.resting.title !== "Floor"
                && thing.FSM.NumberMaker.randomBoolean()
                ) {
                thing.falling = true;
                thing.yvel = thing.FSM.unitsize * -.7;
                thing.FSM.TimeHandler.addEvent(
                    function (): void {
                        thing.falling = false;
                    },
                    42);
            } else {
                // Jump down
                thing.nocollidesolid = true;
                thing.yvel = thing.FSM.unitsize * -2.1;
                thing.FSM.TimeHandler.addEvent(
                    function (): void {
                        thing.nocollidesolid = false;
                    },
                    42);
            }

            thing.resting = undefined;

            return false;
        }

        /**
         * Animation Function for Bloopers starting to "unsqueeze". The "squeeze"
         * class is removed, their height is reset to 12, and their counter reset.
         * 
         * @param {Blooper} thing
         */
        animateBlooperUnsqueezing(thing: IBlooper): void {
            thing.counter = 0;
            thing.squeeze = 0;

            thing.FSM.removeClass(thing, "squeeze");
            thing.FSM.setHeight(thing, 12, true, true);
        }

        /**
         * Animation Function for Podoboos jumping up. Their top is recorded and a 
         * large negative yvel is given; after the jumpheight number of steps, they
         * fall back down.
         * 
         * @param {Podoboo} thing
         */
        animatePodobooJumpUp(thing: IPodoboo): void {
            thing.starty = thing.top;
            thing.yvel = thing.speed * -1;

            thing.FSM.TimeHandler.addEvent(
                thing.FSM.animatePodobooJumpDown,
                thing.jumpHeight,
                thing);
        }

        /**
         * Animation Function for when a Podoboo needs to stop jumping. It obtains 
         * the movePodobooFalling movement to track its descent.
         * 
         * @param {Podoboo} thing
         */
        animatePodobooJumpDown(thing: IPodoboo): void {
            thing.movement = thing.FSM.movePodobooFalling;
        }

        /**
         * Animation Function for a Lakitu throwing a SpinyEgg. The Lakitu hides
         * behind its cloud ("hiding" class), waits 21 steps, then throws an egg up
         * and comes out of "hiding".
         * 
         * @param {Lakitu} thing
         */
        animateLakituThrowingSpiny(thing: ILakitu): boolean {
            if (thing.fleeing || !thing.FSM.isThingAlive(thing)) {
                return true;
            }

            thing.FSM.switchClass(thing, "out", "hiding");
            thing.FSM.TimeHandler.addEvent(
                function (): void {
                    if (thing.dead) {
                        return;
                    }

                    var spawn: ISpinyEgg = <ISpinyEgg>thing.FSM.addThing("SpinyEgg", thing.left, thing.top);
                    spawn.yvel = thing.FSM.unitsize * -2.1;
                    thing.FSM.switchClass(thing, "hiding", "out");
                },
                21);
        }

        /**
         * Animation Function for when a SpinyEgg hits the ground. The SpinyEgg is
         * killed and a Spiny is put in its place, moving towards the player.
         * 
         * @param {SpinyEgg} thing
         */
        animateSpinyEggHatching(thing: ISpinyEgg): void {
            if (!thing.FSM.isThingAlive(thing)) {
                return;
            }

            var spawn: ISpiny = <ISpiny>thing.FSM.addThing("Spiny", thing.left, thing.top - thing.yvel);
            spawn.moveleft = thing.FSM.objectToLeft(thing.FSM.player, spawn);
            thing.FSM.killNormal(thing);
        }

        /**
         * Animation Function for when a Fireball emerges from a player. All that
         * happens is the "Fireball" sound plays.
         * 
         * @param {Fireball} thing
         */
        animateFireballEmerge(thing: IThing): void {
            thing.FSM.AudioPlayer.play("Fireball");
        }

        /**
         * Animation Function for when a Fireball explodes. It is deleted and, 
         * unless big is === 2 (as this is used as a kill Function), a Firework is
         * put in its place.
         * 
         * @param {Fireball} thing
         * @param {Number} [big]   The "level" of death this is (a 2 implies this is
         *                         a sudden death, without animations).
         */
        animateFireballExplode(thing: IFireball, big?: number): void {
            thing.nocollide = true;
            thing.FSM.killNormal(thing);
            if (big === 2) {
                return;
            }

            var output: IFirework = <IFirework>thing.FSM.addThing("Firework");
            thing.FSM.setMidXObj(output, thing);
            thing.FSM.setMidYObj(output, thing);
            output.animate(output);
        }

        /**
         * Animation Function for a Firework, triggered immediately upon spawning.
         * The Firework cycles between "n1" through "n3", then dies.
         * 
         * @param {Firework} thing
         */
        animateFirework(thing: IFirework): void {
            var name: string = thing.className + " n",
                i: number;

            for (i = 0; i < 3; i += 1) {
                thing.FSM.TimeHandler.addEvent(
                    function (i: number): void {
                        thing.FSM.setClass(thing, name + String(i + 1));
                    },
                    i * 7,
                    i);
            }

            thing.FSM.AudioPlayer.play("Firework");

            thing.FSM.TimeHandler.addEvent(
                function (): void {
                    thing.FSM.killNormal(thing);
                },
                i * 7);
        }

        /**
         * Animation Function for the Fireworks found at the end of 
         * EndOutsideCastle. numFireworks dicatates how many to place, and positions
         * are declared within.
         * 
         * @param {Player} thing
         * @param {Collider} other 
         * @remarks The left of other is the right of player, and is 4 units away 
         *          from the center of the door.
         */
        animateEndLevelFireworks(thing: IPlayer, other: IDetectCollision, numFireworks: number): void {
            var doorRight: number = other.left,
                doorLeft: number = doorRight - thing.FSM.unitsize * 8,
                doorBottom: number = other.bottom,
                doorTop: number = doorBottom - thing.FSM.unitsize * 16,
                flag: IThing = thing.FSM.ObjectMaker.make("CastleFlag", {
                    "position": "beginning"
                }),
                flagMovements: number = 28,
                fireInterval: number = 28,
                fireworkPositions: number[][] = [
                    [0, -48],
                    [-8, -40],
                    [8, -40],
                    [-8, -32],
                    [0, -48],
                    [-8, -40]
                ],
                i: number = 0,
                firework: IFirework,
                position: number[];

            thing.FSM.addThing(
                flag,
                doorLeft + thing.FSM.unitsize,
                doorTop - thing.FSM.unitsize * 24);
            thing.FSM.arrayToBeginning(flag, <any[]>thing.FSM.GroupHolder.getGroup(flag.groupType));

            thing.FSM.TimeHandler.addEventInterval(
                function (): void {
                    thing.FSM.shiftVert(flag, thing.FSM.unitsize * -.25);
                },
                1,
                flagMovements);

            if (numFireworks > 0) {
                thing.FSM.TimeHandler.addEventInterval(
                    function (): void {
                        position = fireworkPositions[i];
                        firework = <IFirework>thing.FSM.addThing(
                            "Firework",
                            thing.left + position[0] * thing.FSM.unitsize,
                            thing.top + position[1] * thing.FSM.unitsize
                            );
                        firework.animate(firework);
                        i += 1;
                    },
                    fireInterval,
                    numFireworks);
            }

            thing.FSM.TimeHandler.addEvent(
                function (): void {
                    thing.FSM.AudioPlayer.addEventImmediate(
                        "Stage Clear", "ended", function (): void {
                            thing.FSM.collideLevelTransport(thing, other);
                        });
                },
                i * fireInterval + 420);
        }

        /**
         * Animation Function for a Cannon outputting a BulletBill. This will only
         * happen if the Cannon isn't within 8 units of the player. The spawn flies
         * at a constant rate towards the player.
         * 
         * @param {Cannon} thing
         */
        animateCannonFiring(thing: ICannon): void {
            if (!thing.FSM.isThingAlive(thing)) {
                return;
            }

            // Don't fire if Player is too close
            if (
                thing.FSM.player.right > (
                    thing.left - thing.FSM.unitsize * 8
                    )
                && thing.FSM.player.left < (
                    thing.right + thing.FSM.unitsize * 8
                    )
                ) {
                return;
            }

            var spawn: IBulletBill = thing.FSM.ObjectMaker.make("BulletBill");

            if (thing.FSM.objectToLeft(thing.FSM.player, thing)) {
                spawn.direction = spawn.moveleft = true;
                spawn.xvel *= -1;
                thing.FSM.flipHoriz(spawn);
                thing.FSM.addThing(spawn, thing.left, thing.top);
            } else {
                thing.FSM.addThing(spawn, thing.left + thing.width, thing.top);
            }

            thing.FSM.AudioPlayer.playLocal("Bump", thing.right);
        }

        /**
         * Animation Function for a fiery player throwing a Fireball. The player may
         * only do so if fewer than 2 other thrown Fireballs exist. A new Fireball
         * is created in front of where the player is facing and are sent bouncing
         * away.
         * 
         * @param {Player} thing
         * @remarks Yes, it's called numballs.
         */
        animatePlayerFire(thing: IPlayer): void {
            if (thing.numballs >= 2) {
                return;
            }

            var xloc: number = thing.moveleft
                ? (thing.left - thing.FSM.unitsize / 4)
                : (thing.right + thing.FSM.unitsize / 4),
                ball: IFireball = thing.FSM.ObjectMaker.make("Fireball", {
                    "moveleft": thing.moveleft,
                    "speed": thing.FSM.unitsize * 1.75,
                    "jumpheight": thing.FSM.unitsize * 1.56,
                    "gravity": thing.FSM.MapScreener.gravity * 1.56,
                    "yvel": thing.FSM.unitsize,
                    "movement": thing.FSM.moveJumping
                });

            thing.FSM.addThing(ball, xloc, thing.top + thing.FSM.unitsize * 8);
            ball.animate(ball);
            ball.onDelete = function (): void {
                thing.numballs -= 1;
            };

            thing.numballs += 1;
            thing.FSM.addClass(thing, "firing");

            thing.FSM.TimeHandler.addEvent(
                function (): void {
                    thing.FSM.removeClass(thing, "firing");
                },
                7);
        }

        /**
         * Animation Function that regularly spings CastleFireballs around their
         * parent CastleBlock. The CastleBlock's location and angle determine the
         * location of each CastleFireball, and its dt and direction determine how
         * the angle is changed for the next call.
         * 
         * @param {CastleBlock} thing
         * @param {CastleFireball[]} balls
         */
        animateCastleBlock(thing: ICastleBlock, balls: ICastleFireball[]): void {
            var ax: number = Math.cos(thing.angle * Math.PI) * thing.FSM.unitsize * 4,
                ay: number = Math.sin(thing.angle * Math.PI) * thing.FSM.unitsize * 4,
                i: number;

            for (i = 0; i < balls.length; i += 1) {
                thing.FSM.setMidX(balls[i], thing.left + ax * i);
                thing.FSM.setMidY(balls[i], thing.top + ay * i);
            }

            thing.angle += thing.dt * thing.direction;
        }

        /**
         * Animation Function to close a CastleBridge when the player triggers its
         * killonend after hitting the CastleAxe in EndInsideCastle. Its width is
         * reduced repeatedly on an interval until it's 0.
         * 
         * @param {CastleBridge} thing
         */
        animateCastleBridgeOpen(thing: ISolid): void {
            thing.FSM.TimeHandler.addEvent(
                function (): void {
                    thing.FSM.TimeHandler.addEventInterval(
                        function (): boolean {
                            thing.right -= thing.FSM.unitsize * 2;
                            thing.FSM.setWidth(thing, thing.width - 2);
                            thing.FSM.AudioPlayer.play("Break Block");

                            if (thing.width <= 0) {
                                thing.FSM.AudioPlayer.play("Bowser Falls");
                                return true;
                            }

                            return false;
                        },
                        1,
                        Infinity);
                },
                7);
        }

        /**
         * Animation Function for when a CastleChain opens, which just delays a
         * killNormal call for 7 steps.
         * 
         * @param {CastleChain} thing
         */
        animateCastleChainOpen(thing: ISolid): void {
            thing.FSM.TimeHandler.addEvent(thing.FSM.killNormal, 7, thing);
        }

        /**
         * Animation Function for when the player paddles underwater. Any previous
         * Any previous paddling classes and cycle are removed, and a new one is 
         * added that, when it finishes, remnoves the player's paddlingCycle as 
         * well.
         * 
         * @param {Player} thing
         */
        animatePlayerPaddling(thing: IPlayer): void {
            if (!thing.paddlingCycle) {
                thing.FSM.removeClasses(
                    thing, "skidding paddle1 paddle2 paddle3 paddle4 paddle5"
                    );
                thing.FSM.addClass(thing, "paddling");
                thing.FSM.TimeHandler.cancelClassCycle(
                    thing, "paddlingCycle"
                    );
                thing.FSM.TimeHandler.addClassCycle(
                    thing,
                    [
                        "paddle1", "paddle2", "paddle3", "paddle2", "paddle1",
                        function (): boolean {
                            return thing.paddlingCycle = false;
                        },
                    ],
                    "paddlingCycle",
                    7
                    );
            }
            thing.paddling = thing.paddlingCycle = thing.swimming = true;
            thing.yvel = thing.FSM.unitsize * -.84;
        }

        /**
         * Animation Function for when a player lands to reset size and remove 
         * hopping (and if underwater, paddling) classes. The mod event is fired.
         * 
         * @param {Player} thing
         */
        animatePlayerLanding(thing: IPlayer): void {
            if (thing.crouching && thing.power > 1) {
                thing.FSM.setHeight(thing, 11, true, true);
            }

            if (thing.FSM.hasClass(thing, "hopping")) {
                thing.FSM.switchClass(thing, "hopping", "jumping");
            }

            if (thing.FSM.MapScreener.underwater) {
                thing.FSM.removeClass(thing, "paddling");
            }

            thing.FSM.ModAttacher.fireEvent("onPlayerLanding", thing, thing.resting);
        }

        /**
         * Animation Function for when the player moves off a resting solid. It
         * sets resting to undefined, and if underwater, switches the "running" and
         * "paddling" classes.
         * 
         * @param {Player} thing
         */
        animatePlayerRestingOff(thing: IPlayer): void {
            thing.resting = undefined;
            if (thing.FSM.MapScreener.underwater) {
                thing.FSM.switchClass(thing, "running", "paddling");
            }
        }

        /**
         * Animation Function for when a player breathes a underwater. This creates
         * a Bubble, which slowly rises to the top of the screen.
         * 
         * @param {Player} thing
         */
        animatePlayerBubbling(thing: IPlayer): void {
            thing.FSM.addThing("Bubble", thing.right, thing.top);
        }

        /**
         * Animation Function to give the player a cycle of running classes. The 
         * cycle auto-updates its time as a function of how fast the player is 
         * moving relative to its maximum speed.
         * 
         * @param {Player} thing
         */
        animatePlayerRunningCycle(thing: IPlayer): void {
            thing.FSM.switchClass(thing, "still", "running");

            (<any>thing).running = thing.FSM.TimeHandler.addClassCycle(
                thing,
                [
                    "one", "two", "three", "two"
                ],
                "running",
                function (event: any): void {
                    event.timeout = 5 + Math.ceil(thing.maxspeedsave - Math.abs(thing.xvel));
                });
        }

        /**
         * Animation Function for when a player hops on an enemy. Resting is set to
         * undefined, and a small vertical yvel is given.
         * 
         * @param {Player} thing
         */
        animateCharacterHop(thing: ICharacter): void {
            thing.resting = undefined;
            thing.yvel = thing.FSM.unitsize * -1.4;
        }

        /**
         * Animation Function to start a player transferring through a Pipe. This is
         * generic for entrances and exists horizontally and vertically: movement
         * and velocities are frozen, size is reset, and the piping flag enabled. 
         * The player is also moved into the Scenery group to be behind the Pipe.
         * 
         * @param {Player} thing
         */
        animatePlayerPipingStart(thing: IPlayer): void {
            thing.nocollide = thing.nofall = thing.piping = true;
            thing.xvel = thing.yvel = 0;
            thing.movementOld = thing.movement;
            thing.movement = undefined;

            if (thing.power > 1) {
                thing.FSM.animatePlayerRemoveCrouch(thing);
                thing.FSM.setPlayerSizeLarge(thing);
            } else {
                thing.FSM.setPlayerSizeSmall(thing);
            }
            thing.FSM.removeClasses(thing, "jumping running crouching");

            thing.FSM.AudioPlayer.clearTheme();
            thing.FSM.TimeHandler.cancelAllCycles(thing);
            thing.FSM.GroupHolder.switchObjectGroup(thing, "Character", "Scenery");
        }

        /**
         * Animation Function for when a player is done passing through a Pipe. This
         * is abstracted for exits both horizontally and vertically, typically after
         * an area has just been entered.
         * 
         * @param {Player} thing
         */
        animatePlayerPipingEnd(thing: IPlayer): void {
            thing.movement = thing.movementOld;
            thing.nocollide = thing.nofall = thing.piping = false;

            thing.FSM.AudioPlayer.resumeTheme();
            thing.FSM.GroupHolder.switchObjectGroup(thing, "Scenery", "Character");
        }

        /**
         * Animation Function for when a player is hopping off a pole. It hops off
         * and faces the opposite direction.
         * 
         * @param {Player} thing
         * @param {Boolean} [doRun]   Whether the player should have a running cycle
         *                            added immediately, such as during cutscenes
         *                            (by default, false).
         */
        animatePlayerOffPole(thing: IPlayer, doRun?: boolean): void {
            thing.FSM.removeClasses(thing, "climbing running");
            thing.FSM.addClass(thing, "jumping");

            thing.xvel = 1.4;
            thing.yvel = -.7;
            thing.nocollide = thing.nofall = false;
            thing.gravity = thing.FSM.MapScreener.gravity / 14;

            thing.FSM.TimeHandler.addEvent(
                function (): void {
                    thing.movement = thing.FSM.movePlayer;
                    thing.gravity = thing.FSM.MapScreener.gravity;

                    thing.FSM.unflipHoriz(thing);

                    if (doRun) {
                        thing.FSM.animatePlayerRunningCycle(thing);
                    }
                },
                21);
        }

        /**
         * Animation Function for when a player must hop off a Vine during an area's
         * opening cutscene. The player switches sides, waits 14 steps, then calls
         * animatePlayerOffPole.
         * 
         * @param {Player} thing
         */
        animatePlayerOffVine(thing: IPlayer): void {
            thing.FSM.flipHoriz(thing);
            thing.FSM.shiftHoriz(
                thing,
                (thing.width - 1) * thing.FSM.unitsize
                );

            thing.FSM.TimeHandler.addEvent(thing.FSM.animatePlayerOffPole, 14, thing);
        }


        /* Appearance utilities
        */

        /**
         * Makes one Thing look towards another, chainging lookleft and moveleft in
         * the process.
         * 
         * @param {Thing} thing
         * @param {Thing} other
         */
        lookTowardsThing(thing: ICharacter, other: IThing): void {
            // Case: other is to the left
            if (other.right <= thing.left) {
                thing.lookleft = true;
                thing.moveleft = true;
                thing.FSM.unflipHoriz(thing);
            } else if (other.left >= thing.right) {
                // Case: other is to the right
                thing.lookleft = false;
                thing.moveleft = false;
                thing.FSM.flipHoriz(thing);
            }
        }

        /**
         * Makes one Thing look towards the player, chainging lookleft and moveleft 
         * in the process.
         * 
         * @param {Thing} thing
         * @param {Boolean} [big]   Whether to always change lookleft and moveleft,
         *                          even if lookleft is already accurate (by 
         *                          default, false).
         */
        lookTowardsPlayer(thing: ICharacter, big?: boolean): void {
            // Case: Player is to the left
            if (thing.FSM.player.right <= thing.left) {
                if (!thing.lookleft || big) {
                    thing.lookleft = true;
                    thing.moveleft = false;
                    thing.FSM.unflipHoriz(thing);
                }
            } else if (thing.FSM.player.left >= thing.right) {
                // Case: Player is to the right
                if (thing.lookleft || big) {
                    thing.lookleft = false;
                    thing.moveleft = true;
                    thing.FSM.flipHoriz(thing);
                }
            }
        }


        /* Death functions
        */

        /**
         * Standard Function to kill a Thing, which means marking it as dead and
         * clearing its numquads, resting, movement, and cycles. It will later be
         * marked as gone by its maintain* Function (Solids or Characters).
         * 
         * @param {Thing} thing
         */
        killNormal(thing: IThing): void {
            if (!thing) {
                return;
            }

            thing.hidden = thing.dead = true;
            thing.alive = false;
            thing.numquads = 0;
            thing.movement = undefined;

            if (this.hasOwnProperty("resting")) {
                (<ICharacter>thing).resting = undefined;
            }

            if (thing.FSM) {
                thing.FSM.TimeHandler.cancelAllCycles(thing);
            }

            thing.FSM.ModAttacher.fireEvent("onKillNormal", thing);
        }

        /**
         * Death Function commonly called on characters to animate a small flip
         * before killNormal is called.
         * 
         * @param {Thing} thing
         * @param {Number} [extra]   How much time to wait beyond the standard 70
         *                           steps before calling killNormal (by default, 
         *                           0).
         */
        killFlip(thing: ICharacter, extra: number = 0): void {
            thing.FSM.flipVert(thing);


            if ((<any>thing).bottomBump) {
                (<any>thing).bottomBump = undefined;
            }

            thing.nocollide = thing.dead = true;
            thing.speed = thing.xvel = 0;
            thing.nofall = false;
            thing.resting = thing.movement = undefined;
            thing.yvel = -thing.FSM.unitsize;
            thing.FSM.TimeHandler.addEvent(
                thing.FSM.killNormal, 70 + extra, thing);
        }

        /**
         * Kill Function to replace a Thing with a spawned Thing, determined by the
         * thing's spawnType, in the same location.
         * 
         * @param {Thing} thing 
         * @param {Boolean} [big]   Whether this should skip creating the spawn (by
         *                          default, false).
         */
        killSpawn(thing: ICharacter, big?: boolean): IThing {
            if (big) {
                thing.FSM.killNormal(thing);
                return;
            }

            if (!thing.spawnType) {
                throw new Error("Thing " + thing.title + " has no .spawnType.");
            }

            var spawn: IThing = thing.FSM.ObjectMaker.make(
                thing.spawnType,
                thing.spawnSettings || {});
            thing.FSM.addThing(spawn);
            thing.FSM.setBottom(spawn, thing.bottom);
            thing.FSM.setMidXObj(spawn, thing);

            thing.FSM.killNormal(thing);

            return spawn;
        }

        /**
         * A kill Function similar to killSpawn but more configurable. A spawned 
         * Thing is created with the given attributes and copies over any specified
         * attributes from the original Thing.
         * 
         * @param {Thing} thing
         * @param {String} title   The type of new Thing to create, such as "Goomba".
         * @param {Object} [attributes]   An optional object to pass in to the
         *                                ObjectMaker.make call (by default, {}).
         * @param {String[]} [attributesCopied]   An optional listing of attributes
         *                                        to copy from the original Thing
         *                                        (by default, none).
         */
        killReplace(thing: IThing, title: string, attributes: any, attributesCopied?: string[]): IThing {
            var spawn: IThing,
                i: number;

            if (typeof attributes === "undefined") {
                attributes = {};
            }

            if (typeof attributesCopied !== "undefined") {
                for (i = 0; i < attributesCopied.length; i += 1) {
                    attributes[attributesCopied[i]] = thing[attributesCopied[i]];
                }
            }

            spawn = thing.FSM.ObjectMaker.make(title, attributes);

            if (thing.flipHoriz) {
                thing.FSM.flipHoriz(spawn);
            }

            if (thing.flipVert) {
                thing.FSM.flipVert(spawn);
            }

            thing.FSM.addThing(spawn, thing.left, thing.top);
            thing.FSM.killNormal(thing);

            return spawn;
        }

        /**
         * Kill Function for Goombas. If big isn't specified, it replaces the 
         * killed Goomba with a DeadGoomba via killSpawn.
         * 
         * @param {Thing} thing
         * @param {Boolean} [big]   Whether to call killFlip on the Thing instead of
         *                          killSpawn, such as when a Shell hits it.
         */
        killGoomba(thing: IGoomba, big?: boolean): void {
            if (big) {
                thing.FSM.killFlip(thing);
                return;
            }

            thing.FSM.killSpawn(thing);
        }

        /**
         * Kill Function for Koopas. Jumping and floating Koopas are replacing with
         * an equivalent Koopa that's just walking, while walking Koopas become
         * Shells.
         * 
         * @param {Koopa} thing
         * @param {Boolean} [big]   Whether shells should be immediately killed.
         * @remarks This isn't called when a Shell hits a Koopa.
         */
        killKoopa(thing: IKoopa, big?: boolean): ICharacter {
            var spawn: ICharacter;

            if (thing.jumping || thing.floating) {
                spawn = <ICharacter>thing.FSM.killReplace(
                    thing, "Koopa", undefined, ["smart", "direction", "moveleft"]
                    );
                spawn.xvel = spawn.moveleft ? -spawn.speed : spawn.speed;
            } else {
                spawn = thing.FSM.killToShell(thing, Number(big));
            }

            return spawn;
        }

        /**
         * Kill Function for Bowsers. In reality this is only called when the player
         * Fireballs him or all NPCs are to be killed. It takes five Fireballs to 
         * killFlip a Bowser, which scores 5000 points.
         * 
         * @param {Bowser} thing
         * @param {Boolean} [big]   Whether this should default to killFlip, as in
         *                          an EndInsideCastle cutscene.
         */
        killBowser(thing: IBowser, big?: boolean): void {
            if (big) {
                thing.nofall = false;
                thing.movement = undefined;
                thing.FSM.killFlip(<any>thing.FSM.killSpawn(thing));
                return;
            }

            thing.deathcount += 1;
            if (thing.deathcount === 5) {
                thing.yvel = thing.speed = 0;
                thing.movement = undefined;
                thing.FSM.killFlip(<any>thing.FSM.killSpawn(thing), 350);
                thing.FSM.scoreOn(5000, thing);
            }
        }

        /**
         * Kills a Thing by replacing it with another Thing, typically a Shell or
         * BeetleShell (determined by thing.shelltype). The spawn inherits smartness
         * and location from its parent, and is temporarily given nocollidechar to
         * stop double collision detections.
         * 
         * @param {Thing} thing
         * @param {Number} [big]   Whether the spawned Shell should be killed
         *                         immediately (by default, false).
         */
        killToShell(thing: ICharacter, big?: number): IShell {
            var spawn: IShell,
                nocollidecharold: boolean,
                nocollideplayerold: boolean;

            thing.spawnSettings = {
                "smart": thing.smart
            };

            if (big && big !== 2) {
                thing.spawnType = thing.title;
            } else {
                thing.spawnType = thing.shelltype || "Shell";
            }

            thing.spawnSettings = {
                "smart": thing.smart
            };

            spawn = <IShell>thing.FSM.killSpawn(thing);
            nocollidecharold = spawn.nocollidechar;
            nocollideplayerold = spawn.nocollideplayer;
            spawn.nocollidechar = true;
            spawn.nocollideplayer = true;

            thing.FSM.TimeHandler.addEvent(
                function (): void {
                    spawn.nocollidechar = nocollidecharold;
                    spawn.nocollideplayer = nocollideplayerold;
                },
                7);

            thing.FSM.killNormal(thing);

            if (big === 2) {
                thing.FSM.killFlip(spawn);
            }

            return spawn;
        }

        /**
         * Wipes the screen of any characters or solids that should be gone during
         * an important cutscene, such as hitting an end-of-level flag.
         * For characters, they're deleted if .nokillonend isn't truthy. If they
         * have a .killonend function, that's called on them.
         * Solids are only deleted if their .killonend is true.
         * 
         * @remarks If thing.killonend is a Function, it is called on the Thing.
         * @todo   Rename .killonend to be more accurate
         */
        killNPCs(): void {
            var FSM: FullScreenMario = FullScreenMario.prototype.ensureCorrectCaller(this),
                group: IThing[],
                character: ICharacter,
                solid: ISolid,
                i: number;

            // Characters: they must opt out of being killed with .nokillonend, and
            // may opt into having a function called instead (such as Lakitus).
            group = <ICharacter[]>FSM.GroupHolder.getGroup("Character");
            for (i = group.length - 1; i >= 0; --i) {
                character = <ICharacter>group[i];

                if (!character.nokillend) {
                    character.FSM.killNormal(character);
                    character.FSM.arrayDeleteThing(character, group, i);
                } else if (character.killonend) {
                    character.killonend(character);
                }
            }

            // Solids: they may opt into being deleted
            group = <ISolid[]>FSM.GroupHolder.getGroup("Solid");
            for (i = group.length - 1; i >= 0; --i) {
                solid = <ISolid>group[i];

                if (solid.killonend) {
                    if (solid.killonend.constructor === Function) {
                        (<any>solid.killonend)(solid, group, i);
                    } else {
                        solid.FSM.arrayDeleteThing(solid, group, i);
                    }
                }
            }
        }

        /**
         * Kill Function for Bricks. The Brick is killed an an animateBrickShards
         * animation is timed. If other is provided, it's also marked as the Brick's
         * up, which will kill colliding characters: this works because 
         * maintainSolids happens before maintainCharacters, so the killNormal won't
         * come into play until after the next maintainCharacters call.
         * 
         * @param {Brick} thing
         * @param {Thing} [other]   An optional Thing to mark as the cause of the
         *                          Brick's death (its up attribute). 
         */
        killBrick(thing: IBrick, other?: ICharacter): void {
            thing.FSM.AudioPlayer.play("Break Block");
            thing.FSM.TimeHandler.addEvent(
                thing.FSM.animateBrickShards, 1, thing
                );
            thing.FSM.killNormal(thing);

            if (
                other instanceof thing.FSM.ObjectMaker.getFunction("Thing")
                ) {
                thing.up = other;
            } else {
                thing.up = undefined;
            }
        }

        /**
         * Kill Function for the player. It's big and complicated, but in general...
         * 1. If big === 2, just kill it altogether
         * 2. If the player is large and big isn't true, just power down the player.
         * 3. The player can't survive this, so animate the "shrug" class and an
         *    up-then-down movement. 
         * At the end of 1. and 3., decrease the "lives" and "power" statistics and
         * call the equivalent onPlayerDeath or onGameOver callbacks, depending on
         * how many lives are left. The mod event is also fired.
         * 
         * @param {Thing} thing
         * @param {Number} [big]   The severity of this death: 0 for normal, 1 for
         *                         not survivable, 2 for immediate death.
         */
        killPlayer(thing: IPlayer, big?: number): void {
            if (!thing.alive || thing.flickering || thing.dying) {
                return;
            }

            var FSM: FullScreenMario = thing.FSM,
                area: IArea = <IArea>thing.FSM.MapsHandler.getArea();

            // Large big: real, no-animation death
            if (big === 2) {
                thing.dead = thing.dying = true;
                thing.alive = false;
                FSM.MapScreener.notime = true;
            } else {
                // Regular big: regular (enemy, time, etc.) kill
                // If the player can survive this, just power down
                if (!big && thing.power > 1) {
                    thing.power = 1;
                    FSM.ItemsHolder.setItem("power", 1);
                    FSM.AudioPlayer.play("Power Down");
                    FSM.playerGetsSmall(thing);
                    return;
                } else {
                    // The player can't survive this: animate a death
                    thing.dying = true;

                    FSM.setSize(thing, 7.5, 7, true);
                    FSM.updateSize(thing);
                    FSM.setClass(thing, "character player dead");
                    FSM.thingPauseVelocity(thing);
                    FSM.arrayToEnd(
                        thing, <any[]>FSM.GroupHolder.getGroup(thing.groupType));

                    FSM.MapScreener.notime = true;
                    FSM.MapScreener.nokeys = true;

                    FSM.TimeHandler.cancelAllCycles(thing);
                    FSM.TimeHandler.addEvent(
                        function (): void {
                            FSM.thingResumeVelocity(thing, true);
                            thing.nocollide = true;
                            thing.movement = thing.resting = undefined;
                            thing.gravity = FSM.MapScreener.gravity / 2.1;
                            thing.yvel = FullScreenMario.unitsize * -1.4;
                        },
                        7);
                }
            }

            thing.nocollide = thing.nomove = thing.dead = true;
            FSM.MapScreener.nokeys = true;
            FSM.AudioPlayer.clearAll();
            FSM.AudioPlayer.play("Player Dies");
            FSM.ItemsHolder.decrease("lives");
            FSM.ItemsHolder.setItem("power", 1);

            if (FSM.ItemsHolder.getItem("lives") > 0) {
                FSM.TimeHandler.addEvent(
                    area.onPlayerDeath.bind(FSM),
                    area.onPlayerDeathTimeout,
                    FSM
                    );
            } else {
                FSM.TimeHandler.addEvent(
                    area.onGameOver.bind(FSM),
                    area.onGameOverTimeout,
                    FSM);
            }
        }


        /* Scoring
        */

        /**
         * @this {EightBittr}
         * @param {Number} level   What number call this is in a chain of scoring
         *                         events, such as a Shell or hopping spree.
         * @return {Number}   How many points should be gained (if 0, that means the
         *                    maximum points were passed and gainLife was called).
         */
        findScore(level: number): number {
            var FSM: FullScreenMario = FullScreenMario.prototype.ensureCorrectCaller(this);

            if (level < FSM.pointLevels.length) {
                return FSM.pointLevels[level];
            }

            FSM.gainLife(1);
            return 0;
        }

        /**
         * Driver function to score some number of points for the player and show
         * the gains via an animation.
         * 
         * @this {EightBittr}
         * @param {Number} value   How many points the player is receiving.
         * @param {Boolean} [continuation]   Whether the game shouldn't increase the 
         *                                   score amount in the ItemsHoldr (this will
         *                                   only be false on the first score() call).
         * @remarks   For point gains that should not have a visual animation, 
         *            directly call ItemsHolder.increase("score", value).
         * @remarks   The calling chain will be: 
         *                score -> scoreOn -> scoreAnimateOn -> scoreAnimate          
         */
        score(value: number, continuation?: boolean): void {
            if (!value) {
                return;
            }
            var FSM: FullScreenMario = FullScreenMario.prototype.ensureCorrectCaller(this);

            FSM.scoreOn(value, FSM.player, true);

            if (!continuation) {
                this.ItemsHolder.increase("score", value);
            }
        }

        /**
         * Scores a given number of points for the player, and shows the gains via
         * an animation centered at the top of a thing.
         * 
         * @param {Number} value   How many points the player is receiving.
         * @param {Thing} thing   An in-game Thing to place the visual score text
         *                        on top of and centered.
         * @param {Boolean} [continuation]   Whether the game shouldn't increase the 
         *                                   score amount in the ItemsHoldr (this will
         *                                   only be false on the first score() call).
         * @remarks   The calling chain will be: 
         *                scoreOn -> scoreAnimateOn -> scoreAnimate     
         */
        scoreOn(value: number, thing: IThing, continuation?: boolean): void {
            if (!value) {
                return;
            }
            var text: IText = <IText>thing.FSM.addThing("Text" + value);

            thing.FSM.scoreAnimateOn(<IText>text, thing);

            if (!continuation) {
                this.ItemsHolder.increase("score", value);
            }

            thing.FSM.ModAttacher.fireEvent("onScoreOn", value, thing, continuation);
        }

        /**
         * Centers a text associated with some points gain on the top of a Thing,
         * and animates it updward, setting an event for it to die.
         * 
         * @param {Thing} text   The text whose position is being manipulated.
         * @param {Thing} thing   An in-game Thing to place the visual score text
         *                        on top of and centered.
         * @remarks   The calling chain will be: 
         *                scoreAnimateOn -> scoreAnimate     
         */
        scoreAnimateOn(text: IText, thing: IThing): void {
            thing.FSM.setMidXObj(text, thing);
            thing.FSM.setBottom(text, thing.top);
            thing.FSM.scoreAnimate(text);
        }

        /**
         * Animates a score on top of a Thing.
         * 
         * @param {Thing} thing   
         * @param {Number} [timeout]   How many game ticks to wait before killing
         *                             the text (defaults to 28).
         * @remarks   This is the last function in the score() calling chain:
         *                scoreAnimate <- scoreAnimateOn <- scoreOn <- score
         */
        scoreAnimate(thing: IThing, timeout: number = 28): void {
            thing.FSM.TimeHandler.addEventInterval(
                thing.FSM.shiftVert,
                1,
                timeout,
                thing,
                -thing.FSM.unitsize / 6
                );
            thing.FSM.TimeHandler.addEvent(
                thing.FSM.killNormal, timeout, thing
                );
        }

        /**
         * Inelegant catch-all Function for when the player has hit a shell and 
         * needs points to be scored. This takes into account player star status and
         * Shell resting and peeking. With none of those modifiers, it defaults to
         * scoreOn with 400.
         * 
         * @param {Player} thing
         * @param {Shell} other
         * @remarks See http://themushroomkingdom.net/smb_breakdown.shtml
         */
        scorePlayerShell(thing: IPlayer, other: IShell): void {
            // Star player: 200 points
            if (thing.star) {
                thing.FSM.scoreOn(200, other);
                return;
            }

            // Shells in the air: 8000 points (see guide)
            if (!other.resting) {
                thing.FSM.scoreOn(8000, other);
                return;
            }

            // Peeking shells: 1000 points
            if (other.peeking) {
                thing.FSM.scoreOn(1000, other);
                return;
            }

            // Already hopping: 500 points
            if (thing.jumpcount) {
                thing.FSM.scoreOn(500, other);
                return;
            }

            // All other cases: the shell's default
            thing.FSM.scoreOn(400, other);
        }

        /**
         * Determines the amount a player should score upon hitting a flag, based on
         * the player's y-position.
         * 
         * @param {Player} thing
         * @param {Number} difference   How far up the pole the collision happened,
         *                              by absolute amount (not multiplied by 
         *                              unitsize).
         * @return {Number}
         * @remarks See http://themushroomkingdom.net/smb_breakdown.shtml
         */
        scorePlayerFlag(thing: IThing, difference: number): number {
            var amount: number;

            if (difference < 28) {
                amount = difference < 8 ? 100 : 400;
            } else if (difference < 40) {
                amount = 800;
            } else {
                amount = difference < 62 ? 2000 : 5000;
            }

            return amount;
        }


        /* Audio
        */

        /**
         * @param {FullScreenMario} FSM
         * @param {Number} xloc   The x-location of the sound's source.
         * @return {Number} How loud the sound should be at that position, in [0,1].
         *                  This is louder closer to the player, and nothing to
         *                  the right of the visible screen.
         */
        getVolumeLocal(FSM: FullScreenMario, xloc: number): number {
            if (xloc > FSM.MapScreener.right) {
                return 0;
            }

            return Math.max(
                .14,
                Math.min(
                    .84,
                    (
                        FSM.MapScreener.width - Math.abs(
                            xloc - FSM.player.left
                            )
                        ) / FSM.MapScreener.width
                    )
                );
        }

        /**
         * @param {FullScreenMario} FSM
         * @return {String} The name of the default audio for the current area,
         *                  which is the first word in the area's setting (split on
         *                  spaces).
         */
        getAudioThemeDefault(FSM: FullScreenMario): string {
            return FSM.MapsHandler.getArea().setting.split(" ")[0];
        }


        /* Map sets
        */

        /**
         * Sets the game state to a new map, resetting all Things and inputs in the
         * process. The mod events are fired.
         * 
         * @param {String} [name]   The name of the map (by default, the currently
         *                          played one).
         * @param {Mixed} [location]   The name of the location within the map (by
         *                             default 0 for the first in Array form).
         * @remarks Most of the work here is done by setLocation.
         */
        setMap(name?: string | IFullScreenMario, location?: string | number): void {
            var FSM: FullScreenMario = FullScreenMario.prototype.ensureCorrectCaller(this),
                time: number,
                map: IMap;

            if (typeof name === "undefined" || name.constructor === FullScreenMario) {
                name = FSM.MapsHandler.getMapName();
            }

            map = FSM.MapsHandler.setMap(<string>name);

            FSM.ModAttacher.fireEvent("onPreSetMap", map);

            if (map.seed) {
                FSM.NumberMaker.resetFromSeed(map.seed);
            }

            FSM.ItemsHolder.setItem("world", name);
            FSM.InputWriter.restartHistory();

            FSM.ModAttacher.fireEvent("onSetMap", map);

            FSM.setLocation(location || map.locationDefault || FSM.settings.maps.locationDefault);

            time = (<IArea>FSM.MapsHandler.getArea()).time || (<IMap>FSM.MapsHandler.getMap()).time;
            FSM.ItemsHolder.setItem("time", Number(time));
        }

        /**
         * Sets the game state to a location within the current map, resetting all
         * Things, inputs, the current Area, PixelRender, and MapScreener in the
         * process. The location's entry Function is called to bring a new Player
         * into the game. The mod events are fired.
         * 
         * @param {Mixed} [name]   The name of the location within the map (by
         *                         default 0 for the first in Array form).
         */
        setLocation(name: string | number = 0): void {
            var FSM: FullScreenMario = FullScreenMario.prototype.ensureCorrectCaller(this),
                location: ILocation;

            (<IMapScreenr>FSM.MapScreener).nokeys = false;
            (<IMapScreenr>FSM.MapScreener).notime = false;
            (<IMapScreenr>FSM.MapScreener).canscroll = true;
            FSM.MapScreener.clearScreen();
            FSM.GroupHolder.clearArrays();
            FSM.TimeHandler.cancelAllEvents();

            FSM.MapsHandler.setLocation((name || 0).toString());
            FSM.MapScreener.setVariables();
            location = <ILocation>FSM.MapsHandler.getLocation((name || 0).toString());

            FSM.ModAttacher.fireEvent("onPreSetLocation", location);

            FSM.PixelDrawer.setBackground((<IArea>FSM.MapsHandler.getArea()).background);

            FSM.TimeHandler.addEventInterval(
                function (): boolean {
                    if (!(<IMapScreenr>FSM.MapScreener).notime) {
                        FSM.ItemsHolder.decrease("time", 1);
                    }
                    if (!FSM.ItemsHolder.getItem("time")) {
                        return true;
                    }
                },
                25,
                Infinity);

            FSM.AudioPlayer.clearAll();
            FSM.AudioPlayer.playTheme();

            FSM.QuadsKeeper.resetQuadrants();

            location.entry(FSM, location);

            FSM.ModAttacher.fireEvent("onSetLocation", location);

            FSM.GamesRunner.play();
        }

        /* Map entrances
        */

        /**
         * Standard map entrance Function for dropping from the ceiling. A new 
         * player is placed 16x16 units away from the top-left corner, with
         * location.xloc scrolling applied if necessary.
         * 
         * @param {FullScreenMario} FSM
         * @param {Location} [location]   The calling Location entering into (by
         *                                default, not used).
         */
        mapEntranceNormal(FSM: FullScreenMario, location?: ILocation): void {
            if (location && location.xloc) {
                FSM.scrollWindow(location.xloc * FSM.unitsize);
            }

            FSM.addPlayer(FSM.unitsize * 16, FSM.unitsize * 16);
        }

        /**
         * Standard map entrance Function for starting on the ground. A new player
         * is placed 16x16 units away from the top-left corner, with location.xloc
         * scrolling applied if necessary.
         * 
         * @param {FullScreenMario} FSM
         * @param {Location} [location]   The calling Location entering into (by
         *                                default, not used).
         */
        mapEntrancePlain(FSM: FullScreenMario, location?: ILocation): void {
            if (location && location.xloc) {
                FSM.scrollWindow(location.xloc * FSM.unitsize);
            }

            FSM.addPlayer(FSM.unitsize * 16, FSM.MapScreener.floor * FSM.unitsize);

        }

        /**
         * Map entrance Function for starting on the ground and immediately walking
         * as if in a cutscene. mapEntrancePlain is immediately called, and the 
         * player has movement forced to be walking, with nokeys and notime set to
         * true.
         * 
         * @param {FullScreenMario} FSM
         * @param {Location} [location]   The calling Location entering into (by
         *                                default, not used).
         */
        mapEntranceWalking(FSM: FullScreenMario, location?: ILocation): void {
            FSM.mapEntrancePlain(FSM, location);

            FSM.player.keys.run = 1;
            FSM.player.maxspeed = FSM.player.walkspeed;

            FSM.MapScreener.nokeys = true;
            FSM.MapScreener.notime = true;
        }

        /**
         * Map entrance Function for entering a castle area. The player is simply
         * added at 2 x 56.
         * 
         * @param {FullScreenMario} FSM
         */
        mapEntranceCastle(FSM: FullScreenMario): void {
            FSM.addPlayer(FSM.unitsize * 2, FSM.unitsize * 56);
        }

        /**
         * Map entrance Function for entering an area climbing a Vine. The Vine 
         * enters first by growing, then the player climbs it and hops off. The 
         * player's actions are done via mapEntranceVinePlayer and are triggered
         * when the Vine's top reaches its threshold.
         * 
         * @param {FullScreenMario} FSM
         */
        mapEntranceVine(FSM: FullScreenMario): void {
            var threshold: number = (
                FSM.MapScreener.bottom - FSM.unitsize * 40
                ),
                vine: IVine = <IVine>FSM.addThing(
                    "Vine",
                    FSM.unitsize * 32,
                    FSM.MapScreener.bottom + FSM.unitsize * 8
                    );

            FSM.TimeHandler.addEventInterval(
                function (): boolean {
                    if (vine.top >= threshold) {
                        return false;
                    }

                    vine.movement = undefined;
                    FSM.mapEntranceVinePlayer(FSM, vine);
                    return true;
                },
                1,
                Infinity);
        }

        /**
         * Continuation of mapEntranceVine for the player's actions. The player
         * climbs up the Vine; once it reaches the threshold, it hops off using
         * animatePlayerOffVine.
         * 
         * @param {FullScreenMario} FSM
         * @param {Vine} vine
         */
        mapEntranceVinePlayer(FSM: FullScreenMario, vine: IVine): void {
            var threshold: number = (
                FSM.MapScreener.bottom - FSM.unitsize * 24
                ),
                speed: number = FSM.unitsize / -4,
                player: IPlayer = FSM.addPlayer(
                    FSM.unitsize * 29,
                    FSM.MapScreener.bottom - FSM.unitsize * 4
                    );

            FSM.shiftVert(player, player.height * FSM.unitsize);

            FSM.collideVine(player, vine);

            FSM.TimeHandler.addEventInterval(
                function (): boolean {
                    FSM.shiftVert(player, speed);
                    if (player.top < threshold) {
                        FSM.TimeHandler.addEvent(
                            FSM.animatePlayerOffVine, 49, player
                            );
                        return true;
                    }
                    return false;
                },
                1,
                Infinity);
        }

        /**
         * Map entrance Function for coming in through a vertical Pipe. The player 
         * is added just below the top of the Pipe, and is animated to rise up 
         * through it like an Italian chestburster.
         * 
         * @param {FullScreenMario} FSM
         * @param {Location} [location]   The calling Location entering into (by
         *                                default, not used).
         */
        mapEntrancePipeVertical(FSM: FullScreenMario, location?: ILocation): void {
            if (location && location.xloc) {
                FSM.scrollWindow(location.xloc * FSM.unitsize);
            }

            FSM.addPlayer(
                (
                    location.entrance.left
                    + FSM.player.width * FSM.unitsize / 2
                    ),
                (
                    location.entrance.top
                    + FSM.player.height * FSM.unitsize
                    )
                );

            FSM.animatePlayerPipingStart(FSM.player);
            FSM.AudioPlayer.play("Pipe");

            FSM.TimeHandler.addEventInterval(
                function (): boolean {
                    FSM.shiftVert(FSM.player, FSM.unitsize / -4);

                    if (FSM.player.bottom <= location.entrance.top) {
                        FSM.animatePlayerPipingEnd(FSM.player);
                        return true;
                    }

                    return false;
                },
                1,
                Infinity);
        }

        /**
         * Map entrance Function for coming in through a horizontal Pipe. The player 
         * is added just to the left of the entrance, and is animated to pass  
         * through it like an Italian chestburster.
         * 
         * @param {FullScreenMario} FSM
         * @param {Location} [location]   The calling Location entering into (by
         *                                default, not used).
         */
        mapEntrancePipeHorizontal(FSM: FullScreenMario, location?: ILocation): void {
            throw new Error("mapEntrancePipeHorizontal is not yet implemented.");
        }

        /**
         * Map entrance Function for the player reincarnating into a level, 
         * typically from a random map. The player is placed at 16 x 0 and a
         * Resting Stone placed some spaces below via playerAddRestingStone.
         * 
         * @param {FullScreenMario} FSM
         */
        mapEntranceRespawn(FSM: FullScreenMario): void {
            FSM.MapScreener.nokeys = false;
            FSM.MapScreener.notime = false;
            FSM.MapScreener.canscroll = true;

            FSM.addPlayer(FSM.unitsize * 16, 0);
            FSM.animateFlicker(FSM.player);

            if (!FSM.MapScreener.underwater) {
                FSM.playerAddRestingStone(FSM.player);
            }

            FSM.ModAttacher.fireEvent("onPlayerRespawn");
        }


        /* Map exits
        */

        /**
         * Map exit Function for leaving through a vertical Pipe. The player is
         * animated to pass through it and then transfer locations.
         * 
         * @param {Player} thing
         * @param {Pipe} other
         */
        mapExitPipeVertical(thing: IPlayer, other: IPipe): void {
            if (!thing.resting || typeof (other.transport) === "undefined"
                || thing.right + thing.FSM.unitsize * 2 > other.right
                || thing.left - thing.FSM.unitsize * 2 < other.left) {
                return;
            }

            thing.FSM.animatePlayerPipingStart(thing);
            thing.FSM.AudioPlayer.play("Pipe");

            thing.FSM.TimeHandler.addEventInterval(
                function (): boolean {
                    thing.FSM.shiftVert(thing, thing.FSM.unitsize / 4);

                    if (thing.top <= other.top) {
                        return false;
                    }

                    thing.FSM.TimeHandler.addEvent(
                        function (): void {
                            if (other.transport.constructor === Object) {
                                thing.FSM.setMap(other.transport.map);
                            } else {
                                thing.FSM.setLocation(other.transport);
                            }
                        },
                        42);

                    return true;
                },
                1,
                Infinity);
        }

        /**
         * Map exit Function for leaving through a horiontal Pipe. The player is
         * animated to pass through it and then transfer locations.
         * 
         * @param {Player} thing
         * @param {Pipe} other
         * @param {Boolean} [shouldTransport]   Whether not resting and not paddling
         *                                      does not imply the player cannot
         *                                      pass through the Pipe (by default,
         *                                      false, as this is normal).
         * @remarks The shouldTransport argument was added because the "Bouncy 
         *          Bounce!" mod rendered some areas unenterable without it.
         */
        mapExitPipeHorizontal(thing: IPlayer, other: IPipe, shouldTransport?: boolean): void {
            if (!shouldTransport && !thing.resting && !thing.paddling) {
                return;
            }

            if (thing.top < other.top || thing.bottom > other.bottom) {
                return;
            }

            if (!thing.keys.run) {
                return;
            }

            thing.FSM.animatePlayerPipingStart(thing);
            thing.FSM.AudioPlayer.play("Pipe");

            thing.FSM.TimeHandler.addEventInterval(
                function (): boolean {
                    thing.FSM.shiftHoriz(thing, thing.FSM.unitsize / 4);

                    if (thing.left <= other.left) {
                        return false;
                    }

                    thing.FSM.TimeHandler.addEvent(
                        function (): void {
                            thing.FSM.setLocation(other.transport);
                        },
                        42);

                    return true;
                },
                1,
                Infinity);
        }


        /* Map creation
        */

        /**
         * The onMake callback for Areas. Attributes are copied as specified in the
         * prototype, and the background is set based on the setting.
         * 
         * @this {Area}
         */
        initializeArea(): void {
            var scope: IArea = <IArea><any>this,
                i: string;

            // Copy all attributes, if they exist
            if (scope.attributes) {
                for (i in scope.attributes) {
                    if (scope.hasOwnProperty(i) && scope[i]) {
                        FullScreenMario.prototype.proliferate(scope, scope.attributes[i]);
                    }
                }
            }

            scope.setBackground(scope);
        }

        /**
         * Sets an area's background as a function of its setting.
         * 
         * @param {Area} area
         * @remarks In the future, it might be more elegant to make Areas inherit
         * from base Area types (Overworld, etc.) so this inelegant switch
         * statement doesn't have to be used.
         */
        setAreaBackground(area: IArea): void {
            // Non-underwater Underworld, Castle, and all Nights: black background
            if (
                area.setting.indexOf("Underwater") === -1
                && (
                    area.setting.indexOf("Underworld") !== -1
                    || area.setting.indexOf("Castle") !== -1
                    || area.setting.indexOf("Night") !== -1
                    )
                ) {
                area.background = "#000000";
            } else {
                // Default (typically Overworld): sky blue background
                area.background = "#5c94fc";
            }
        }

        /**
         * @param {Number} yloc   A height to find the distance to the floor from.
         * @param {Boolean} [correctUnitsize]   Whether the yloc accounts for 
         *                                      unitsize expansion (e.g. 48 rather
         *                                      than 12, for unitsize=4).
         * @return {Number} The distance from the absolute base (bottom of the 
         *                  user's viewport) to a specific height above the floor 
         *                  (in the form given by map functions, distance from the 
         *                  floor).
         */
        getAbsoluteHeight(yloc: number, correctUnitsize?: boolean): number {
            var FSM: FullScreenMario = FullScreenMario.prototype.ensureCorrectCaller(this),
                height: number = yloc + FSM.MapScreener.height;

            if (!correctUnitsize) {
                height *= FSM.unitsize;
            }

            return height;
        }

        /**
         * Adds a PreThing to the map and stretches it to fit a width equal to the 
         * current map's outermost boundaries.
         * 
         * @this {EightBittr}
         * @param {PreThing} prething
         * @return {Thing} A strethed Thing, newly added via addThing.
         */
        mapAddStretched(prething: any): IThing {
            var FSM: FullScreenMario = FullScreenMario.prototype.ensureCorrectCaller(this),
                boundaries: any = FSM.MapsHandler.getArea().boundaries,
                y: number = (
                    ((<IMapScreenr>FSM.MapScreener).floor - prething.y)
                    * FSM.unitsize
                    ),
                thing: IThing = FSM.ObjectMaker.make(prething.thing, {
                    "width": boundaries.right - boundaries.left,
                    "height": (
                        prething.height || FSM.getAbsoluteHeight(prething.y)
                        )
                });

            return <IThing>FSM.addThing(thing, boundaries.left, y);
        }

        /**
         * Analyzes a PreThing to be placed to the right of the current map's
         * boundaries (after everything else).
         * 
         * @this {EightBittr}
         * @param {PreThing} prething
         */
        mapAddAfter(prething: any): void {
            var FSM: FullScreenMario = FullScreenMario.prototype.ensureCorrectCaller(this),
                MapsCreator: MapsCreatr.MapsCreatr = FSM.MapsCreator,
                MapsHandler: MapsHandlr.MapsHandlr = FSM.MapsHandler,
                prethings: { [i: string]: IPreThing[] } = <{ [i: string]: IPreThing[] }>MapsHandler.getPreThings(),
                area: IArea = <IArea>MapsHandler.getArea(),
                map: MapsCreatr.IMapsCreatrMap = MapsHandler.getMap(),
                boundaries: any = FSM.MapsHandler.getArea().boundaries;

            prething.x = boundaries.right;
            MapsCreator.analyzePreSwitch(prething, prethings, area, map);
        }


        /* Map macros
        */

        /**
         * Sample macro with no functionality, except to console.log a listing of 
         * the arguments provided to each macro function.
         * For all real macros, arguments are listed as the keys given as members of
         * the reference object.
         * They also ignore the "x" and "y" arguments, which 
         * are the x-location and y-location of the output (and both default to 0),
         * and the "macro" argument, which is listed as their alias.
         * 
         * @alias Example
         * @param {Object} reference   A listing of the settings for this macro,
         *                             from an Area's .creation Array. This should 
         *                             be treated as const!
         * @param {Object[]} prethings   The Area's actual .creation Array, which
         *                               consists of a bunch of reference Objects.
         * @param {Area} area   The area currently being generated.
         * @param {Map} map   The map containing the area currently being generated.
         */
        macroExample(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            console.log("This is a macro that may be called by a map creation.");
            console.log("The arguments are:\n");
            console.log("Reference (the listing from area.creation):  ", reference);
            console.log("Prethings (the area's listing of prethings): ", prethings);
            console.log("Area      (the currently generated area):    ", area);
            console.log("Map       (the map containing the area):     ", map);
            console.log("Scope     (the custom scope container):      ", scope);
        }

        /**
         * Macro to place a single type of Thing multiple times, drawing from a
         * bottom/left corner to a top/right corner.
         * 
         * @alias Fill
         * @param {String} thing   The name of the Thing to fill (e.g. "Brick").
         * @param {Number} xnum   How many times to repeat the Thing horizontally
         *                        to the right (defaults to 1)
         * @param {Number} ynum   How many times to repeat the Thing vertically
         *                        upwards (defaults to 1)
         * @param {Number} xwidth   How many units are between the left edges of 
         *                          placed Things horizontally (defaults to 0)
         * @param {Number} yheight   How many units are between the top edges of
         *                           placed Things vertically (defaults to 0)
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [y]   The y-location (defaults to 0).
         * @example   { "macro": "Fill", "thing": "Brick", 
         *              "x": 644, "y": 64, "xnum": 5, "xwidth": 8 }
         * @return {Object[]}
         */
        macroFillPreThings(
            reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            var defaults: any = scope.ObjectMaker.getFullPropertiesOf(reference.thing),
                xnum: number = reference.xnum || 1,
                ynum: number = reference.ynum || 1,
                xwidth: number = reference.xwidth || defaults.width,
                yheight: number = reference.yheight || defaults.height,
                x: number = reference.x || 0,
                yref: number = reference.y || 0,
                outputs: any[] = [],
                output: any,
                o: number = 0,
                y: number,
                i: number,
                j: number;

            for (i = 0; i < xnum; ++i) {
                y = yref;
                for (j = 0; j < ynum; ++j) {
                    output = {
                        "x": x,
                        "y": y,
                        "macro": undefined
                    };
                    outputs.push(FullScreenMario.prototype.proliferate(output, reference, true));
                    o += 1;
                    y += yheight;
                }
                x += xwidth;
            }

            return outputs;
        }

        /**
         * Macro to continuously place a listing of Things multiple times, from left
         * to right. This is commonly used for repeating background scenery.
         * 
         * @alias Pattern
         * @param {String} pattern   The name of the pattern to print, from the
         *                           listing in scope.settings.maps.patterns.
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [y]   The y-location (defaults to 0).
         * @param {Number} [repeat]   How many times to repeat the overall pattern 
         *                            (by default, 1).
         * @param {Number[]} [skips]   Which numbered items to skip, if any.
         * @return {Object[]}
         */
        macroFillPrePattern(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            // Make sure the pattern exists before doing anything
            if (!scope.settings.maps.patterns[reference.pattern]) {
                console.warn("An unknown pattern is referenced: " + reference);
                return;
            }
            var pattern: any = scope.settings.maps.patterns[reference.pattern],
                length: number = pattern.length,
                defaults: any = scope.ObjectMaker.getFullProperties(),
                repeats: number = reference.repeat || 1,
                xpos: number = reference.x || 0,
                ypos: number = reference.y || 0,
                outputs: any[] = [],
                o: number = 0,
                skips: any = {},
                prething: any,
                output: any,
                i: number,
                j: number;

            // If skips are given, record them in an Object for quick access
            if (typeof reference.skips !== "undefined") {
                for (i = 0; i < reference.skips.length; i += 1) {
                    skips[reference.skips[i]] = true;
                }
            }

            // For each time the pattern should be repeated:
            for (i = 0; i < repeats; i += 1) {
                // For each Thing listing in the pattern:
                for (j = 0; j < length; j += 1) {
                    // Don't place if marked in skips
                    if (skips[j]) {
                        continue;
                    }

                    prething = pattern[j];
                    output = {
                        "thing": prething[0],
                        "x": xpos + prething[1],
                        "y": ypos + prething[2]
                    };
                    output.y += defaults[prething[0]].height;

                    if (prething[3]) {
                        output.width = prething[3];
                    }

                    outputs.push(output);
                    o += 1;
                }
                xpos += pattern.width;
            }

            return outputs;
        }

        /**
         * Macro to place a Floor Thing with infinite height. All settings are 
         * passed in except "macro", which becomes undefined.
         * 
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [y]   The y-location (defaults to 0).
         * @param {Number} [width]   How wide the Floor should be (by default, 8).
         * @return {Object}
         */
        macroFloor(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            var x: number = reference.x || 0,
                y: number = reference.y || 0,
                floor: any = FullScreenMario.prototype.proliferate(
                    {
                        "thing": "Floor",
                        "x": x,
                        "y": y,
                        "width": (reference.width || 8),
                        "height": "Infinity"
                    },
                    reference,
                    true);

            floor.macro = undefined;

            return floor;
        }

        /**
         * Macro to place a Pipe, possibly with a pirahna, location hooks, and/or
         * infinite height. All settings are copied to Pipe except for "macro",
         * which becomes undefined.
         * 
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [y]   The y-location (defaults to 0).
         * @param {Mixed} [height]   How high the Pipe should be (by default, 8). 
         *                           May be a Number or "Infinity".
         * @param {Boolean} [piranha]   Whethere there should be a Piranha spawned
         *                              with the Pipe (by default, false).
         * @param {Mixed} [transport]   What location the Pipe should transport to
         *                              (by default, none).
         * @param {Mixed} [entrance]   What location the Pipe should act as an
         *                             entrance to (by default, none).
         * @return {Object[]}
         */
        macroPipe(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            var x: number = reference.x || 0,
                y: number = reference.y || 0,
                height: number | string = reference.height || 16,
                pipe: any = FullScreenMario.prototype.proliferate(
                    {
                        "thing": "Pipe",
                        "x": x,
                        "y": y,
                        "width": 16,
                        "height": reference.height || 8
                    },
                    reference,
                    true),
                output: any[] = [pipe];

            pipe.macro = undefined;

            if (height === "Infinity") {
                pipe.height = scope.MapScreener.height;
            } else {
                pipe.y += height;
            }

            if (reference.piranha) {
                output.push({
                    "thing": "Piranha",
                    "x": x + 4,
                    "y": pipe.y + 12,
                    "onPipe": true
                });
            }

            return output;
        }

        /**
         * Macro to place a horizontal Pipe with a vertical one, likely with 
         * location hooks.
         * 
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [y]   The y-location (defaults to 0).
         * @param {Mixed} [height]   How high the Pipe should be (by default, 8). 
         *                           May be a Number or "Infinity".
         * @param {Mixed} [transport]   What location the Pipe should transport to
         *                              (by default, none).
         * @param {Boolean} [scrollEnabler]   Whether there should be a 
         *                                    ScrollEnabler placed on top of the
         *                                    PipeVertical (by default, false).
         * @param {Boolean} [scrollBlocker]   Whether there should be a 
         *                                    ScrollBlocker placed to the right of
         *                                    the PipeVertical (by default, false).
         * @return {Object[]}
         * @remarks This could be used in maps like 1-2, but there's no real need to 
         *          take the time (unless you're a volunteer and want something to 
         *          do!). It was introduced for WorldSeedr generation.
         */
        macroPipeCorner(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            var x: number = reference.x || 0,
                y: number = reference.y || 0,
                height: number = reference.height || 16,
                output: any[] = [
                    {
                        "thing": "PipeHorizontal",
                        "x": x,
                        "y": y,
                        "transport": reference.transport || 0
                    },
                    {
                        "thing": "PipeVertical",
                        "x": x + 16,
                        "y": y + height - 16,
                        "height": height
                    }
                ];

            if (reference.scrollEnabler) {
                output.push({
                    "thing": "ScrollEnabler",
                    "x": x + 16,
                    "y": y + height + 48,
                    "height": 64,
                    "width": 16
                });
            }

            if (reference.scrollBlocker) {
                output.push({
                    "thing": "ScrollBlocker",
                    "x": x + 32
                });
            }

            return output;
        }

        /**
         * Macro to place a large Tree. 
         * 
         * @param {Number} width   How wide the Tree should be (preferably a 
         *                         multiple of eight
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [y]   The y-location (defaults to 0).
         * @param {Boolean} [solidTrunk]   Whether the trunk scenery should be 
         *                                 listed in the Solids group instead of
         *                                 Scenery for the sake of overlaps (by
         *                                 default, false).
         * @return {Object[]}
         * @remarks Although the tree trunks in later trees overlap earlier ones, 
         *          it's ok because the pattern is indistinguishible when placed 
         *          correctly.
         */
        macroTree(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            var x: number = reference.x || 0,
                y: number = reference.y || 0,
                width: number = reference.width || 24,
                output: any[] = [
                    {
                        "thing": "TreeTop",
                        "x": x,
                        "y": y,
                        "width": width
                    }
                ];

            if (width > 16) {
                output.push({
                    "thing": "TreeTrunk",
                    "x": x + 8,
                    "y": y - 8,
                    "width": width - 16,
                    "height": "Infinity",
                    "groupType": reference.solidTrunk ? "Solid" : "Scenery"
                });
            }

            return output;
        }

        /**
         * Macro to place a large Shroom (a Tree that looks like a large Mushroom). 
         * 
         * @param {Number} width   How wide the Shroom should be (preferably a 
         *                         multiple of eight).
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [y]   The y-location (defaults to 0).
         * @param {Boolean} [solidTrunk]   Whether the trunk scenery should be 
         *                                 listed in the Solids group instead of
         *                                 Scenery for the sake of overlaps (by
         *                                 default, false).
         * @return {Object[]}
         * @remarks Although the shroom trunks in later shrooms overlap earlier  
         *          ones, it's ok because the pattern is indistinguishible when 
         *          placed correctly.
         */
        macroShroom(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            var x: number = reference.x || 0,
                y: number = reference.y || 0,
                width: number = reference.width || 24,
                output: any[] = [
                    {
                        "thing": "ShroomTop",
                        "x": x,
                        "y": y,
                        "width": width
                    }
                ];

            if (width > 16) {
                output.push({
                    "thing": "ShroomTrunk",
                    "x": x + (width - 8) / 2,
                    "y": y - 8,
                    "height": Infinity,
                    "groupType": reference.solidTrunk ? "Solid" : "Scenery"
                });
            }

            return output;
        }

        /**
         * Macro to place Water of infinite height. All settings are copied to the 
         * Water except for "macro", which becomes undefined.
         * 
         * @param {Number} width   How wide the Water should be.
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [y]   The y-location (defaults to 0).
         * @return {Object}
         */
        macroWater(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            var x: number = reference.x || 0,
                y: number = (reference.y || 0) + 2, // water is 3.5 x 5.5
                output: any = FullScreenMario.prototype.proliferate(
                    {
                        "thing": "Water",
                        "x": x,
                        "y": y,
                        "height": "Infinity",
                        "macro": undefined
                    },
                    reference,
                    true);

            return output;
        }

        /**
         * Macro to place a row of Bricks at y = 88.
         * 
         * @param {Number} width   How wide the ceiling should be (eight times the
         *                         number of Bricks).
         * @param {Number} [x]   The x-location (defaults to 0).
         * @return {Object}
         */
        macroCeiling(reference: any): any {
            return {
                "macro": "Fill",
                "thing": "Brick",
                "x": reference.x,
                "y": 88,
                "xnum": (reference.width / 8) | 0,
                "xwidth": 8
            };
        }

        /**
         * Macro to place a bridge, possibly with columns at the start and/or end.
         * 
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [y]   The y-location (defaults to 0).
         * @param {Number} [width]   How wide the bridge should be (by default, 16).
         * @param {Boolean} [begin]   Whether the first 8 units should be taken up
         *                            by an infinitely high Stone column (by 
         *                            default, false).
         * @param {Boolean} [end]   Whether the last 8 units should be taken up by
         *                          an infinitely high Stone column (by default,
         *                          false).
         * @return {Object[]}
         */
        macroBridge(reference: any): any {
            var x: number = reference.x || 0,
                y: number = reference.y || 0,
                width: number = Math.max(reference.width || 0, 16),
                output: any[] = [];

            // A beginning column reduces the width and pushes it forward
            if (reference.begin) {
                width -= 8;
                output.push({
                    "thing": "Stone",
                    "x": x,
                    "y": y,
                    "height": "Infinity"
                });
                x += 8;
            }

            // An ending column just reduces the width 
            if (reference.end) {
                width -= 8;
                output.push({
                    "thing": "Stone",
                    "x": x + width,
                    "y": y,
                    "height": "Infinity"
                });
            }

            // Between any columns is a BridgeBase with a Railing on top
            output.push({ "thing": "BridgeBase", "x": x, "y": y, "width": width });
            output.push({ "thing": "Railing", "x": x, "y": y + 4, "width": width });

            return output;
        }

        /**
         * Macro to place a scale on the map, which is two Platforms seemingly
         * suspended by Strings.
         * 
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [y]   The y-location (defaults to 0).
         * @param {Number} [widthLeft]   How wide the left Platform should be (by
         *                               default, 24).
         * @param {Number} [widthRight]   How wide the right Platform should be (by
         *                               default, 24).
         * @param {Number} [between]   How much space there should be between
         *                             Platforms (by default, 40).
         * @param {Number} [dropLeft]   How far down from y the left platform should
         *                              start (by default, 24).
         * @param {Number} [dropRight]   How far down from y the right platform
         *                               should start (by default, 24).
         * @return {Object[]}
         */
        macroScale(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            var x: number = reference.x || 0,
                y: number = reference.y || 0,
                unitsize: number = scope.unitsize,
                widthLeft: number = reference.widthLeft || 24,
                widthRight: number = reference.widthRight || 24,
                between: number = reference.between || 40,
                dropLeft: number = reference.dropLeft || 24,
                dropRight: number = reference.dropRight || 24,
                collectionName: string = "ScaleCollection--" + [
                    x, y, widthLeft, widthRight, dropLeft, dropRight
                ].join(","),
                stringLeft: any = {
                    "thing": "String",
                    "x": x,
                    "y": y - 4,
                    "height": dropLeft - 4,
                    "collectionName": collectionName,
                    "collectionKey": "stringLeft"
                },
                stringRight: any = {
                    "thing": "String",
                    "x": x + between,
                    "y": y - 4,
                    "height": dropRight - 4,
                    "collectionName": collectionName,
                    "collectionKey": "stringRight"
                },
                stringMiddle: any = {
                    "thing": "String",
                    "x": x + 4,
                    "y": y,
                    "width": between - 7,
                    "collectionName": collectionName,
                    "collectionKey": "stringMiddle"
                },
                cornerLeft: any = {
                    "thing": "StringCornerLeft",
                    "x": x,
                    "y": y
                },
                cornerRight: any = {
                    "thing": "StringCornerRight",
                    "x": x + between - 4,
                    "y": y
                },
                platformLeft: any = {
                    "thing": "Platform",
                    "x": x - (widthLeft / 2),
                    "y": y - dropLeft,
                    "width": widthLeft,
                    "inScale": true,
                    "tension": (dropLeft - 1.5) * unitsize,
                    "onThingAdd": scope.spawnScalePlatform,
                    "collectionName": collectionName,
                    "collectionKey": "platformLeft"
                },
                platformRight: any = {
                    "thing": "Platform",
                    "x": x + between - (widthRight / 2),
                    "y": y - dropRight,
                    "width": widthRight,
                    "inScale": true,
                    "tension": (dropRight - 1.5) * unitsize,
                    "onThingAdd": scope.spawnScalePlatform,
                    "collectionName": collectionName,
                    "collectionKey": "platformRight"
                };

            return [
                stringLeft,
                stringRight,
                stringMiddle,
                cornerLeft,
                cornerRight,
                platformLeft,
                platformRight
            ];
        }

        /**
         * Macro to place what appears to be a PlatformGenerator on the map (in 
         * actuality, it is multiple Platforms vertically that know how to respawn).
         * 
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [direction]   What direction to travel (either -1 or 1;
         *                               defaults to 1).
         * @param {Number} [width]   How wide the Platforms should be (by default,
         *                           16).
         * @return {Object[]}
         */
        macroPlatformGenerator(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            var output: any[] = [],
                direction: number = reference.direction || 1,
                levels: number[] = direction > 0 ? [0, 48] : [8, 56],
                width: number = reference.width || 16,
                x: number = reference.x || 0,
                yvel: number = direction * scope.unitsize * .42,
                i: number;

            for (i = 0; i < levels.length; i += 1) {
                output.push({
                    "thing": "Platform",
                    "x": x,
                    "y": levels[i],
                    "width": width,
                    "yvel": yvel,
                    "movement": scope.movePlatformSpawn
                });
            }

            output.push({
                "thing": "PlatformString",
                "x": x + (width / 2) - .5,
                "y": scope.MapScreener.floor,
                "width": 1,
                "height": scope.MapScreener.height / scope.unitsize
            });

            return output;
        }

        /**
         * Macro to place a Warp World group of Pipes, Texts, Piranhas, and 
         * detectors.
         * 
         * @param {String[]} warps   The map names each Pipe should warp to.
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [y]   The y-location (defaults to 0).
         * @param {Number} [textHeight]   How far above the Piranhas to place the
         *                                CustomText labels (by default, 8).
         * 
         * @return {Object[]}
         */
        macroWarpWorld(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            var output: any[] = [],
                x: number = reference.x || 0,
                y: number = reference.y || 0,
                textHeight: number = reference.hasOwnProperty("textHeight") ? reference.textHeight : 8,
                warps: string[] = reference.warps,
                collectionName: string = "WarpWorldCollection-" + warps.join("."),
                keys: number[] = [],
                i: number;

            output.push({
                "thing": "CustomText",
                "x": x + 8,
                "y": y + textHeight + 56,
                "texts": [{
                    "text": "WELCOME TO WARP WORLD!"
                }],
                "textAttributes": {
                    "hidden": true
                },
                "collectionName": collectionName,
                "collectionKey": "Welcomer"
            });

            output.push({
                "thing": "DetectCollision",
                "x": x + 64,
                "y": y + 174,
                "width": 40,
                "height": 102,
                "activate": scope.activateWarpWorld,
                "collectionName": collectionName,
                "collectionKey": "Detector"
            });

            for (i = 0; i < warps.length; i += 1) {
                keys.push(i);
                output.push({
                    "macro": "Pipe",
                    "x": x + 8 + i * 32,
                    "height": 24,
                    "transport": { "map": warps[i] + "-1" },
                    "collectionName": collectionName,
                    "collectionKey": i + "-Pipe"
                });
                output.push({
                    "thing": "Piranha",
                    "x": x + 12 + i * 32,
                    "y": y + 36,
                    "collectionName": collectionName,
                    "collectionKey": i + "-Piranha"
                });
                output.push({
                    "thing": "CustomText",
                    "x": x + 14 + i * 32,
                    "y": y + 32 + textHeight,
                    "texts": [{
                        "text": String(warps[i])
                    }],
                    "textAttributes": {
                        "hidden": true
                    },
                    "collectionName": collectionName,
                    "collectionKey": i + "-Text"
                });
            }

            if (warps.length === 1) {
                for (i = 2; i < output.length; i += 1) {
                    output[i].x += 32;
                }
            }

            return output;
        }

        /**
         * Macro to place a DetectCollision that will start the map spawning random
         * CheepCheeps intermittently.
         * 
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [width]   How wide the infinitely tall DetectCollision
         *                           should be (by default, 8).
         * @return {Object}
         */
        macroCheepsStart(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            return {
                "thing": "DetectCollision",
                "x": reference.x || 0,
                "y": scope.MapScreener.floor,
                "width": reference.width || 8,
                "height": scope.MapScreener.height / scope.unitsize,
                "activate": scope.activateCheepsStart
            };
        }

        /**
         * Macro to place a DetectCollision that will stop the map spawning random
         * CheepCheeps intermittently.
         * 
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [width]   How wide the infinitely tall DetectCollision
         *                           should be (by default, 8).
         * @return {Object}
         */
        macroCheepsStop(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            return {
                "thing": "DetectCollision",
                "x": reference.x || 0,
                "y": scope.MapScreener.floor,
                "width": reference.width || 8,
                "height": scope.MapScreener.height / scope.unitsize,
                "activate": scope.activateCheepsStop
            };
        }

        /**
         * Macro to place a DetectCollision that will start the map spawning random
         * BulletBills intermittently.
         * 
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [width]   How wide the infinitely tall DetectCollision
         *                           should be (by default, 8).
         * @return {Object}
         */
        macroBulletBillsStart(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            return {
                "thing": "DetectCollision",
                "x": reference.x || 0,
                "y": scope.MapScreener.floor,
                "width": reference.width || 8,
                "height": scope.MapScreener.height / scope.unitsize,
                "activate": scope.activateBulletBillsStart
            };
        }

        /**
         * Macro to place a DetectCollision that will stop the map spawning random
         * BulletBills intermittently.
         * 
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [width]   How wide the infinitely tall DetectCollision
         *                           should be (by default, 8).
         * @return {Object}
         */
        macroBulletBillsStop(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            return {
                "thing": "DetectCollision",
                "x": reference.x || 0,
                "y": scope.MapScreener.floor,
                "width": reference.width || 8,
                "height": scope.MapScreener.height / scope.unitsize,
                "activate": scope.activateBulletBillsStop
            };
        }

        /**
         * Macro to place a DetectCollision that will tell any current Lakitu to 
         * flee the scene.
         * 
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [width]   How wide the infinitely tall DetectCollision
         *                           should be (by default, 8).
         * @return {Object}
         */
        macroLakituStop(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            return {
                "thing": "DetectCollision",
                "x": reference.x || 0,
                "y": scope.MapScreener.floor,
                "width": reference.width || 8,
                "height": scope.MapScreener.height / scope.unitsize,
                "activate": scope.activateLakituStop
            };
        }

        /**
         * Macro to place a small castle, which is really a collection of sceneries.
         * 
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [y]   The y-location (defaults to 0).
         * @param {Mixed} [transport]   What map or location to shift to after
         *                              ending theatrics (collidePlayerTransport).
         * @param {Number} [walls]   How many CastleWall Things should be placed to
         *                           the right of the castle (by default, 2).
         * @return {Object[]}
         */
        macroCastleSmall(reference: any): any {
            var output: any[] = [],
                x: number = reference.x || 0,
                y: number = reference.y || 0,
                i: number,
                j: number;

            // Base filling left
            for (i = 0; i < 2; i += 1) { // x
                output.push({
                    "thing": "BrickHalf",
                    "x": x + i * 8,
                    "y": y + 4,
                    "position": "end"
                });

                for (j = 1; j < 3; j += 1) { // y
                    output.push({
                        "thing": "BrickPlain",
                        "x": x + i * 8,
                        "y": y + 4 + j * 8,
                        "position": "end"
                    });
                }
            }

            // Base filling right
            for (i = 0; i < 2; i += 1) { // x
                output.push({
                    "thing": "BrickHalf",
                    "x": x + 24 + i * 8,
                    "y": y + 4,
                    "position": "end"
                });

                for (j = 1; j < 3; j += 1) { // y
                    output.push({
                        "thing": "BrickPlain",
                        "x": x + 24 + i * 8,
                        "y": y + 4 + j * 8,
                        "position": "end"
                    });
                }
            }

            // Medium railing left
            output.push({
                "thing": "CastleRailing",
                "x": x,
                "y": y + 24,
                "position": "end"
            });

            // Medium railing center
            for (i = 0; i < 3; i += 1) {
                output.push({
                    "thing": "CastleRailingFilled",
                    "x": x + (i + 1) * 8,
                    "y": y + 24,
                    "position": "end"
                });
            }

            // Medium railing right
            output.push({
                "thing": "CastleRailing",
                "x": x + 32,
                "y": y + 24,
                "position": "end"
            });

            // Top railing
            for (i = 0; i < 3; i += 1) {
                output.push({
                    "thing": "CastleRailing",
                    "x": x + (i + 1) * 8,
                    "y": y + 40,
                    "position": "end"
                });
            }

            // Top bricking
            for (i = 0; i < 2; i += 1) {
                output.push({
                    "thing": "CastleTop",
                    "x": x + 8 + i * 12,
                    "y": y + 36,
                    "position": "end"
                });
            }

            // Door, and detector if required
            output.push({
                "thing": "CastleDoor",
                "x": x + 16,
                "y": y + 20,
                "position": "end"
            });
            if (reference.transport) {
                output.push({
                    "thing": "DetectCollision",
                    "x": x + 24,
                    "y": y + 16,
                    "height": 16,
                    "activate": FullScreenMario.prototype.collideCastleDoor,
                    "transport": reference.transport,
                    "position": "end"
                });
            }

            return output;
        }

        /**
         * Macro to place a large castle, which is really a collection of sceneries
         * underneath a small castle.
         * 
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [y]   The y-location (defaults to 0).
         * @param {Mixed} [transport]   What map or location to shift to after
         *                              ending theatrics (collidePlayerTransport).
         * @return {Object[]}
         */
        macroCastleLarge(reference: any): any {
            var output: any[] = [],
                x: number = reference.x || 0,
                y: number = reference.y || 0,
                i: number,
                j: number;

            output.push({
                "macro": "CastleSmall",
                "x": x + 16,
                "y": y + 48
            });

            // CastleWalls left
            for (i = 0; i < 2; i += 1) { // x
                output.push({
                    "thing": "CastleWall",
                    "x": x + i * 8,
                    "y": y + 48
                });
            }

            // Bottom doors with bricks on top
            for (i = 0; i < 3; i += 1) { // x
                output.push({
                    "thing": "CastleDoor",
                    "x": x + 16 + i * 16,
                    "y": y + 20,
                    "position": "end"
                });
                for (j = 0; j < 2; j += 1) {
                    output.push({
                        "thing": "BrickPlain",
                        "x": x + 16 + i * 16,
                        "y": y + 28 + j * 8
                    });
                    output.push({
                        "thing": "BrickHalf",
                        "x": x + 16 + i * 16,
                        "y": y + 40 + j * 4
                    });
                }
            }

            // Bottom bricks with doors on top
            for (i = 0; i < 2; i += 1) { // x
                for (j = 0; j < 3; j += 1) { // y
                    output.push({
                        "thing": "BrickPlain",
                        "x": x + 24 + i * 16,
                        "y": y + 8 + j * 8
                    });
                }
                output.push({
                    "thing": "CastleDoor",
                    "x": x + 24 + i * 16,
                    "y": y + 44
                });
            }

            // Railing (filled)
            for (i = 0; i < 5; i += 1) { // x
                output.push({
                    "thing": "CastleRailingFilled",
                    "x": x + 16 + i * 8,
                    "y": y + 48
                });
            }

            // CastleWalls right
            j = reference.hasOwnProperty("walls") ? reference.walls : 2;
            for (i = 0; i < j; i += 1) { // x
                output.push({
                    "thing": "CastleWall",
                    "x": x + 56 + i * 8,
                    "y": y + 48,
                    "position": "end"
                });
            }

            if (reference.transport) {
                output.push({
                    "thing": "DetectCollision",
                    "x": x + 24,
                    "y": y + 16,
                    "height": 16,
                    "activate": FullScreenMario.prototype.collideCastleDoor,
                    "transport": reference.transport,
                    "position": "end"
                });
            }

            return output;
        }

        /**
         * Macro to place the typical starting Things for the inside of a castle
         * area.
         * 
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [y]   The y-location (defaults to 0).
         * @param {Number} [width]   How wide the entire shebang should be (by 
         *                           default, 40).
         * @return {Object[]}
         */
        macroStartInsideCastle(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            var x: number = reference.x || 0,
                y: number = reference.y || 0,
                width: number = (reference.width || 0) - 40,
                output: any[] = [
                    {
                        "thing": "Stone",
                        "x": x,
                        "y": y + 48,
                        "width": 24,
                        "height": Infinity
                    },
                    {
                        "thing": "Stone",
                        "x": x + 24,
                        "y": y + 40,
                        "width": 8,
                        "height": Infinity
                    },
                    {
                        "thing": "Stone",
                        "x": x + 32,
                        "y": y + 32,
                        "width": 8,
                        "height": Infinity
                    }
                ];

            if (width > 0) {
                output.push({
                    "macro": "Floor",
                    "x": x + 40,
                    "y": y + 24,
                    "width": width
                });
            }

            return output;
        }

        /**
         * Macro to place the typical ending Things for the inside of an outdoor
         * area.
         * 
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [y]   The y-location (defaults to 0).
         * @param {Mixed} [transport]   What map or location to shift to after 
         *                              ending theatrics (collidePlayerTransport).
         * @param {Boolean} [large]   Whether this should place a large castle
         *                            instead of a small (by default, false).
         * @param {Number} [castleDistance]   How far from the flagpole to the 
         *                                    castle (by default, 24 for large
         *                                    castles and 32 for small).
         * @param {Number} [walls]   For large castles, how many CastleWall Things
         *                           should be placed after (by default, 2).
         * @return {Object[]}
         */
        macroEndOutsideCastle(reference: any): any {
            var x: number = reference.x || 0,
                y: number = reference.y || 0,
                collectionName: string = "EndOutsideCastle-" + [
                    reference.x, reference.y, reference.large
                ].join(","),
                output: any[];

            // Output starts off with the general flag & collision detection
            output = [
                // Initial collision detector
                {
                    "thing": "DetectCollision", x: x, y: y + 108, height: 100,
                    "activate": FullScreenMario.prototype.collideFlagpole,
                    "activateFail": FullScreenMario.prototype.killNormal,
                    "noActivateDeath": true,
                    "collectionName": collectionName,
                    "collectionKey": "DetectCollision"
                },
                // Flag (scenery)
                {
                    "thing": "Flag", "x": x - 4.5, "y": y + 79.5,
                    "collectionName": collectionName,
                    "collectionKey": "Flag"
                },
                {
                    "thing": "FlagTop", "x": x + 1.5, "y": y + 84,
                    "collectionName": collectionName,
                    "collectionKey": "FlagTop"
                },
                {
                    "thing": "FlagPole", "x": x + 3, "y": y + 80,
                    "collectionName": collectionName,
                    "collectionKey": "FlagPole"
                },
                // Bottom stone
                {
                    "thing": "Stone", "x": x, "y": y + 8,
                    "collectionName": collectionName,
                    "collectionKey": "FlagPole"
                },
            ];

            if (reference.large) {
                output.push({
                    "macro": "CastleLarge",
                    "x": x + (reference.castleDistance || 24),
                    "y": y,
                    "transport": reference.transport,
                    "walls": reference.walls || 8
                });
            } else {
                output.push({
                    "macro": "CastleSmall",
                    "x": x + (reference.castleDistance || 32),
                    "y": y,
                    "transport": reference.transport
                });
            }

            return output;
        }

        /**
         * Macro to place the typical ending Things for the inside of a castle area.
         * 
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [y]   The y-location (defaults to 0).
         * @param {Mixed} [transport]   What map or location to shift to after 
         *                              ending theatrics (collidePlayerTransport).
         * @param {String} [npc]   Which NPC to use (either "Toad" or "Peach"; 
         *                         "Toad" by default).
         * @param {Boolean} [hard]   Whether Bowser should be "hard" (by default,
         *                           false).
         * @param {String} [spawnType]   What the Bowser's spawnType should be for
         *                               fireball deaths (by default, "Goomba").
         * @param {Boolean} [throwing]   Whether the Bowser is also throwing hammers
         *                               (by default, false).
         * @param {Boolean} [topScrollEnabler]   Whether a ScrollEnabler should be 
         *                                       added like the ones at the end of
         *                                       large underground PipeCorners (by
         *                                       default, false).
         * @return {Object[]}
         */
        macroEndInsideCastle(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            var x: number = reference.x || 0,
                y: number = reference.y || 0,
                npc: string = reference.npc || "Toad",
                output: any[],
                texts: any[],
                keys: string[];

            if (npc === "Toad") {
                keys = ["1", "2"];
                texts = [{
                    "thing": "CustomText",
                    "x": x + 164,
                    "y": y + 64,
                    "texts": [{
                        "text": "THANK YOU MARIO!"
                    }],
                    "textAttributes": {
                        "hidden": true
                    },
                    "collectionName": "endInsideCastleText",
                    "collectionKey": "1"
                }, {
                        "thing": "CustomText",
                        "x": x + 152,
                        "y": y + 48,
                        "texts": [{
                            "text": "BUT OUR PRINCESS IS IN"
                        }, {
                                "text": "ANOTHER CASTLE!"
                            }],
                        "textAttributes": {
                            "hidden": true
                        },
                        "collectionName": "endInsideCastleText",
                        "collectionKey": "2"
                    }];
            } else if (npc === "Peach") {
                keys = ["1", "2", "3"];
                texts = [{
                    "thing": "CustomText",
                    "x": x + 164,
                    "y": y + 64,
                    "texts": [{
                        "text": "THANK YOU MARIO!"
                    }],
                    "textAttributes": {
                        "hidden": true
                    },
                    "collectionName": "endInsideCastleText",
                    "collectionKey": "1"
                }, {
                        "thing": "CustomText",
                        "x": x + 152,
                        "y": y + 48,
                        "texts": [{
                            "text": "YOUR QUEST IS OVER.",
                            "offset": 12
                        }, {
                                "text": "WE PRESENT YOU A NEW QUEST."
                            }],
                        "textAttributes": {
                            "hidden": true
                        },
                        "collectionName": "endInsideCastleText",
                        "collectionKey": "2"
                    }, {
                        "thing": "CustomText",
                        "x": x + 152,
                        "y": 32,
                        "texts": [{
                            "text": "PRESS BUTTON B",
                            "offset": 8
                        }, {
                                "text": "TO SELECT A WORLD"
                            }],
                        "textAttributes": {
                            "hidden": true
                        },
                        "collectionName": "endInsideCastleText",
                        "collectionKey": "3"
                    }];
            }

            output = [
                { "thing": "Stone", "x": x, "y": y + 88, "width": 256 },
                { "macro": "Water", "x": x, "y": y, "width": 104 },
                // Bridge & Bowser area
                { "thing": "CastleBridge", "x": x, "y": y + 24, "width": 104 },
                {
                    "thing": "Bowser", "x": x + 69, "y": y + 42,
                    "hard": reference.hard,
                    "spawnType": reference.spawnType || "Goomba",
                    "throwing": reference.throwing
                },
                { "thing": "CastleChain", "x": x + 96, "y": y + 32 },
                // Axe area
                { "thing": "CastleAxe", "x": x + 104, "y": y + 40 },
                { "thing": "ScrollBlocker", "x": x + 112 },
                { "macro": "Floor", "x": x + 104, "y": y, "width": 152 },
                {
                    "thing": "Stone", "x": x + 104, "y": y + 32,
                    "width": 24, "height": 32
                },
                {
                    "thing": "Stone", "x": x + 112, "y": y + 80,
                    "width": 16, "height": 24
                },
                // Peach's Magical Happy Chamber of Fantastic Love
                {
                    "thing": "DetectCollision", "x": x + 180,
                    "activate": scope.collideCastleNPC,
                    "transport": reference.transport,
                    "collectionName": "endInsideCastleText",
                    "collectionKey": "npc",
                    "collectionKeys": keys
                },
                { "thing": npc, "x": x + 200, "y": 13 },
                { "thing": "ScrollBlocker", "x": x + 256 }
            ];

            if (reference.topScrollEnabler) {
                output.push({
                    "thing": "ScrollEnabler",
                    "x": x + 96, "y": y + 140,
                    "height": 52, "width": 16
                });
                output.push({
                    "thing": "ScrollEnabler",
                    "x": x + 240, "y": y + 140,
                    "height": 52, "width": 16
                });
            }

            output.push.apply(output, texts);
            return output;
        }

        /**
         * Macro to place a DetectSpawn that will call activateSectionBefore to 
         * start a stretch section.
         * 
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [y]   The y-location (defaults to 0).
         * @param {Number} [section]   Which of the area's sections to spawn (by
         *                             default, 0).
         * @return {Object}
         */
        macroSection(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            return {
                "thing": "DetectSpawn",
                "x": reference.x || 0,
                "y": reference.y || 0,
                "activate": scope.activateSectionBefore,
                "section": reference.section || 0
            };
        }

        /**
         * Macro to place a DetectCollision to mark the current section as passed.
         * 
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [y]   The y-location (defaults to 0).
         * @param {Number} [width]   How wide the DetectCollision should be (by
         *                           default, 8).
         * @param {Number} [height]   How high the DetectCollision should be (by
         *                            default, 8).
         * @return {Object}
         */
        macroSectionPass(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            return {
                "thing": "DetectCollision",
                "x": reference.x || 0,
                "y": reference.y || 0,
                "width": reference.width || 8,
                "height": reference.height || 8,
                "activate": function (thing: IThing): void {
                    thing.FSM.MapScreener.sectionPassed = true;
                }
            };
        }

        /**
         * Macro to place a DetectCollision to mark the current section as failed.
         * 
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [y]   The y-location (defaults to 0).
         * @param {Number} [width]   How wide the DetectCollision should be (by
         *                           default, 8).
         * @param {Number} [height]   How high the DetectCollision should be (by
         *                            default, 8).
         * @return {Object}
         */
        macroSectionFail(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            return [
                {
                    "thing": "DetectCollision",
                    "x": reference.x,
                    "y": reference.y,
                    "width": reference.width || 8,
                    "height": reference.height || 8,
                    "activate": function (thing: IThing): void {
                        thing.FSM.MapScreener.sectionPassed = false;
                    }
                }
            ];
        }

        /**
         * Macro to place a DetectSpawn that will spawn a following section based on
         * whether the current one was marked as passed or failed.
         * 
         * @param {Number} [x]   The x-location (defaults to 0).
         * @param {Number} [y]   The y-location (defaults to 0).
         * @param {Number} [pass]   Which section to spawn if passed (by default, 
         *                          0).
         * @param {Number} [fail]   Which section to spawn if failed (by default, 
         *                          0).
         * @return {Object}
         */
        macroSectionDecider(reference: any,
            prethings: any[],
            area: IArea,
            map: IMap,
            scope: any): any {
            return {
                "thing": "DetectSpawn",
                "x": reference.x || 0,
                "y": reference.y || 0,
                "activate": function (thing: ISectionDetector): void {
                    if (thing.FSM.MapScreener.sectionPassed) {
                        thing.section = reference.pass || 0;
                    } else {
                        thing.section = reference.fail || 0;
                    }
                    thing.FSM.activateSectionBefore(thing);
                }
            };
        }


        /* Miscellaneous utilities
        */

        /**
         * Ensures the current object is a GameStartr by throwing an error if it 
         * is not. This should be used for functions in any GameStartr descendants
         * that have to call 'this' to ensure their caller is what the programmer
         * expected it to be.
         * 
         * @param {Mixed} current   
         */
        ensureCorrectCaller(current: any): FullScreenMario {
            if (!(current instanceof FullScreenMario)) {
                throw new Error("A function requires the scope ('this') to be the "
                    + "manipulated FullScreenMario object. Unfortunately, 'this' is a "
                    + typeof (this) + ".");
            }
            return current;
        }
    }
}
