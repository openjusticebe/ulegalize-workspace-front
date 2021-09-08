import React, { useEffect } from 'react';
import { Button } from 'reactstrap';

/**
 * React Chronometer
 */
export default function Chrono( props ) {

    const { addPrestation , location } = props;
    const [seconds, setSeconds] = React.useState( '00' );
    const [minutes, setMinutes] = React.useState( '00' );
    const [hours, setHours] = React.useState( '00' );
    const [isActive, setIsActive] = React.useState( false );
    const [counter, setCounter] = React.useState( 0 );

    useEffect( () => {
        let intervalId;

        if ( isActive ) {
            intervalId = setInterval( () => {
                const secondCounter = counter % 60;
                const minuteCounter = Math.floor( counter / 60 ) % 60;
                const hourCounter = Math.floor( counter / 3600 );

                let computedSecond =
                    String( secondCounter ).length === 1
                        ? `0${secondCounter}`
                        : secondCounter;
                let computedMinute =
                    String( minuteCounter ).length === 1
                        ? `0${minuteCounter}`
                        : minuteCounter;
                let computedHour =
                    String( hourCounter ).length === 1
                        ? `0${hourCounter}`
                        : hourCounter;

                setSeconds( computedSecond );
                setMinutes( computedMinute );
                setHours( computedHour );

                setCounter( ( counter ) => counter + 1 );

            }, 1000 );
        }

        addPrestation( seconds, minutes, hours );
        return () => clearInterval( intervalId );

    }, [isActive, counter, location.pathname] );

    const stopTimer = () => {
        setIsActive( false );
        setCounter( 0 );
        setSeconds( '00' );
        setMinutes( '00' );
        setHours( '00' );
    };

    return (
        <div className="chrono">
            <div className="time">
                <span className="hours">{hours}</span>
                <span>:</span>
                <span className="minutes">{minutes}</span>
                <span>:</span>
                <span className="seconds">{seconds}</span>
            </div>
            <div className="buttons">
                <Button onClick={() => setIsActive( !isActive )} size="sm" color="primary">
                    {isActive ? 'Pause' : 'Start'}
                </Button>
                <Button onClick={stopTimer} size="sm" color="danger">
                    Reset
                </Button>
            </div>
        </div>
    );
}
