package com.vulon.Controllers;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FirstController {


    @GetMapping("/hello")
    public ResponseEntity<String> hello(
            @RequestParam(name = "name", required = false, defaultValue = "Dima") String name
    ) {
        return new ResponseEntity<>("Hello, " + name, HttpStatus.OK);
    }
}
