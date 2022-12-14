import {
  Box,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableContainer,
  NumberInput,
  NumberInputField,
  Text,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Center,
  Divider,
  Button,
  Image,
  Icon,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import React from "react";
import UserNavbar from "../navbar/UserNavbar";
import SupportedCard from "../../Images/SupportedCards.png";
import { BsCreditCard2BackFill, BsCashStack } from "react-icons/bs";
import { DeleteIcon } from "@chakra-ui/icons";
import "./Cart.css";
import { useCart } from "react-use-cart";
import { RoleContext } from "../../App";
import { useContext } from "react";
import { useNavigate } from 'react-router-dom';

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export default function ItemPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const role = useContext(RoleContext);
  const {
    isEmpty,
    items,
    cartTotal,
    updateItemQuantity,
    removeItem,
    emptyCart,
  } = useCart();
  let totalprice;
  let order = {
    orders: [{}],
  };
  let paymentID,paymentStatus;
  const addorder = async () => {
    totalprice = cartTotal;
    order.orders = items;
    console.log(paymentID)
    if (paymentID) {
      paymentStatus = "Done";
    } else {
      paymentStatus = "Pending";
    }
    paymentID = false;
    try {
      const res = await fetch("/addOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order,
          totalprice,
          studentname: role.name,
          stuid: role._id,
          paymentStatus,
        }),
      });

      const dataa = await res.json();

      // if (dataa === "404") {
      //   return alert("Wrong");
      // }
      if (dataa) {
        toast({
          title: `Order Successful , Your Order ID : ${dataa}`,
          description : "Please wait till your food is ready ????",
          position: "top",
          status : "success", 
          duration : 6000,
          isClosable: true,
        })
        navigate('/user/menupage')
      }
    } catch (err) {
      alert(err);
    }
    emptyCart();
  };

  async function displayRazorpay() {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const options = {
      key: "rzp_test_AF7oK8dU9P697X",
      currency: "INR",
      amount: cartTotal * 100,
      name: "VIT Canteen",
      description: "Thank you for choosing VIT Canteen",
      image: "http://localhost:1337/logo.svg",
      handler: function (response) {
        paymentID = response.razorpay_payment_id;
        addorder();
      },
    };
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  }

  // if (isEmpty) return <h1 className=" text-center "> Your Cart is Empty </h1>;
  return (
    <>
      <UserNavbar />
      <Flex flexDirection="row" justifyContent="space-between" p="5">
        <div className="responsive-div">
          <Box
            w="100%"
            h="100%"
            p="5"
            borderColor="white"
            border="1px"
            borderRadius="8px"
          >
            <Heading as="h2" fontSize="2.8rem" noOfLines={1}>
              Food Cart
            </Heading>
            <Center>
              <Divider orientation="horizontal" />
            </Center>
            <TableContainer mt="14">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th fontSize="lg"></Th>
                    <Th fontSize="lg">Photo</Th>
                    <Th fontSize="lg">Name</Th>
                    <Th fontSize="lg">Price</Th>
                    <Th fontSize="lg">Quantity</Th>
                    <Th fontSize="lg" isNumeric>
                      SubTotal
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {isEmpty && (
                    <Tr>
                      <Td>Your Cart Is Empty</Td>
                    </Tr>
                  )}
                  {items.map((item, index) => {
                    return (
                      <Tr key={item.id}>
                        <Td>{index + 1}</Td>
                        <Td>
                          <Image
                            // borderRadius="full"
                            objectFit="contain"
                            boxSize="100px"
                            src={item.image}
                            alt="Dan Abramov"
                          />{" "}
                        </Td>
                        <Td>{item.name}</Td>
                        <Td>{item.price}</Td>
                        <Td>
                          <NumberInput
                            w="16"
                            value={item.quantity}
                            defaultValue={1}
                            min={0}
                            max={5}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper
                                onClick={() =>
                                  updateItemQuantity(item.id, item.quantity + 1)
                                }
                              />
                              <NumberDecrementStepper
                                onClick={() =>
                                  updateItemQuantity(item.id, item.quantity - 1)
                                }
                              />
                            </NumberInputStepper>

                            <IconButton
                              colorScheme="teal"
                              aria-label="Call Segun"
                              size="md"
                              variant="outline"
                              onClick={() => {
                                removeItem(item.id);
                              }}
                              icon={<DeleteIcon />}
                            />
                          </NumberInput>
                        </Td>
                        <Td isNumeric>{item.itemTotal}</Td>
                      </Tr>
                    );
                  })}
                </Tbody>
                <Tfoot>
                  <Tr>
                    <Th></Th>
                    <Th></Th>
                    <Th isNumeric></Th>
                    <Th isNumeric></Th>
                    <Th isNumeric fontSize="lg">
                      Grand Total
                    </Th>
                    <Th isNumeric fontSize="lg">
                      {cartTotal}
                    </Th>
                  </Tr>
                </Tfoot>
              </Table>
            </TableContainer>
          </Box>
          {/* <Center height='600'>
            <Divider orientation='vertical' />
          </Center> */}
          <Box w="100%" h="100%" p="6">
            <Heading as="h2" fontSize="2.4rem" noOfLines={1}>
              Billing
            </Heading>
            <Center>
              <Divider orientation="horizontal" />
            </Center>
            <Box p="10" display="flex" justifyContent="space-between">
              <Text fontSize="2xl">Grand Total</Text>
              <Text fontSize="2xl">
                <strong>???{cartTotal}</strong>
              </Text>
            </Box>
            <Center>
              <Divider orientation="horizontal" />
            </Center>
            <Text fontSize="2xl" mt="5">
              WE ACCEPT:
            </Text>
            <Image src={SupportedCard} alt="" />
            <Button
              onClick={displayRazorpay}
              colorScheme="teal"
              w="100%"
              mt="10"
              size="lg"
            >
              <Icon as={BsCreditCard2BackFill} />
              &nbsp;&nbsp;Pay Online
            </Button>
            <Divider orientation="horizontal" mt="8" />
            <Button
              colorScheme="teal"
              w="100%"
              mt="10"
              size="lg"
              onClick={addorder}
            >
              <Icon as={BsCashStack} /> &nbsp;&nbsp;Pay By Cash
            </Button>
          </Box>
        </div>
      </Flex>
    </>
  );
}
