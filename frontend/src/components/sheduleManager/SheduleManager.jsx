import React ,{ useEffect, useRef, useState } from 'react'
import Calender from '../calender/Calender'
import AvailableSpaces from '../availableSpaces/AvailableSpaces'
import {getAllSpaces} from '../../services/SpaceService'
import {getAllReservation} from '../../services/ReservationService'
import { MdClose } from "react-icons/md";
import classNames from "classnames";


import styles from './SheduleManager.module.scss'

const SheduleManager = ({
    selectedDays,
    startTime,
    endTime,
    capacity,
    selectedFacilities}) => {

         //filter reservations according to the space selected - default - 1
  const [reservations, setReservations] = useState([]);
  const [spaceReservations, setSpaceReservations] = useState([]);
  const [allSpaces, setAllSpaces] = useState([]);
  const [filteredSpaces, setFilteredSpaces] = useState([]);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);




  async function getSpaces() {
    await getAllSpaces(setAllSpaces);
  }

  async function getReservations() {
    await getAllReservation(setReservations);
  }

    // Get the user from localStorage on component mount
    useEffect(() => {
      const user = localStorage.getItem('user');
      setIsUserLoggedIn(!!user); // Set isUserLoggedIn to true if user exists, false otherwise
    }, []);

  useEffect(() => {
    if (reservations.length !== 0) {
      setSpaceReservations(
        reservations.filter((reservation) => reservation.spaceId === 1)
      );
    }
  }, [reservations]);

   //whenever the capacity change, change the displayed spaces using the filteredSpaces state
   useEffect(() => {
    if (allSpaces?.length !== 0) {
      setFilteredSpaces(
        allSpaces?.filter(
          (space) =>
            space.capacity <= capacity[1] &&
            space.capacity >= capacity[0] &&
            selectedFacilities.every((facility) =>
              space.facilitiesList.includes(facility)
            )
        )
      );
    }
  }, [allSpaces, capacity, selectedFacilities]);

  //This is for special cases, if the already selected space if filtered out
  //or if there are no matching spaces available
  useEffect(() => {
    if (filteredSpaces.length !== 0) {
      setSelectSpace(filteredSpaces[0].id);
      setSelectSpaceName(filteredSpaces[0].name);
      setSpaceReservations(
        reservations.filter(
          (reservation) => reservation.spaceId === selectSpace
        )
      );
    } else if (filteredSpaces.length === 0) {
      setSpaceReservations([]);
    }
  }, [filteredSpaces]);

  //initially fetching the data
  useEffect(() => {
    getSpaces();
    getReservations();
  }, []);

  //Available Spaces Selection
  const [selectSpace, setSelectSpace] = useState(1);
  const [isSpaceInfoOpen, setIsSpaceInfoOpen] = useState(false);

  const spaceInfoRef = useRef();
  //close space when clicked outside
  useEffect(() => {
    let handler = (e) => {
      if (
        !spaceInfoRef.current.contains(e.target) //if the click is on the modal
      ) {
        setIsSpaceInfoOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  });
  const handleSpaceClick = (id) => {
    //if already selected, then show more details on the space
    if (selectSpace === id) {
      setIsSpaceInfoOpen(true);
    } else {
      setSelectSpace(id);
      setSpaceReservations(
        reservations.filter((reservation) => reservation.spaceId === id)
      );
    }
  };

  //pass down the space name to the addEvent prop
  const [selectSpaceName, setSelectSpaceName] = useState(" ");
  useEffect(() => {
    try {
      setSelectSpaceName(allSpaces?.find((s) => s.id === selectSpace).name);
      setSpaceReservations(
        reservations.filter(
          (reservation) => reservation.spaceId === selectSpace
        )
      );
    } catch (error) {
      //pass
      //When it first renders, there won't be any spaces.
      //so spaces.find will return nothing.
    }
  }, [selectSpace]);


  return (
    <>
      <div className={styles.container}>
        <AvailableSpaces
          availableSpaces={filteredSpaces}
          handleClick={handleSpaceClick}
          select={selectSpace}
        />
        <Calender
          getReservations={getReservations}
          selectSpace={selectSpace}
          selectSpaceName={selectSpaceName}
          spaceReservations={spaceReservations}
          selectedDays={selectedDays}
          startTime={startTime}
          endTime={endTime}
          updateReservations={getReservations}
          isUserLoggedIn={isUserLoggedIn}
        />
      </div>

      <div
        className={classNames(
          styles.overlay,
          isSpaceInfoOpen && styles.showOverlay
        )}
      ></div>
      <div
        className={classNames(
          styles.spaceInfoContainer,
          isSpaceInfoOpen && styles.open
        )}
        ref={spaceInfoRef}
      >
        <button onClick={() => setIsSpaceInfoOpen(false)}>
          <MdClose /> Close
        </button>

        {isSpaceInfoOpen && (
          <>
            <div className={styles.spaceTitle}>
              {filteredSpaces.find((space) => space.id === selectSpace).name}
            </div>
            <p className={styles.spaceInfoDescription}>
              {
                filteredSpaces.find((space) => space.id === selectSpace)
                  .description
              }
            </p>
            <div className={styles.capacity}>
              <span>Capacity:</span>
              {
                filteredSpaces.find((space) => space.id === selectSpace)
                  .capacity
              }
            </div>

            <div className={styles.facilities}>
              <span>Facilities:</span>
              {filteredSpaces
                .find((space) => space.id === selectSpace)
                .facilitiesList.join(", ")}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default SheduleManager
