package com.VenueVista.VenueVista.controller;

import com.VenueVista.VenueVista.controller.RequestResponse.ReservationRequest;
import com.VenueVista.VenueVista.controller.RequestResponse.ReservationResponse;
import com.VenueVista.VenueVista.exception.AllReadyReservedException;
import com.VenueVista.VenueVista.exception.InvalidDataException;
import com.VenueVista.VenueVista.service.EmailService;
import com.VenueVista.VenueVista.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/reservations")
@CrossOrigin("*")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;
    private final EmailService emailService;

    @PostMapping("/createreservations")
    public ReservationResponse handleReservation(@RequestBody ReservationRequest reservationRequest) throws InvalidDataException, AllReadyReservedException {
        ReservationResponse response = reservationService.handleReservation(reservationRequest);
        emailService.sendReservationConfirmation(reservationRequest);
        return response;
    }

}
