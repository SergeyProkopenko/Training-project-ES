import {MqGwDecorators} from "../../../../lib/mq-gw-api/src/decorators/mq.gw.decorators";
import EnableMqGw = MqGwDecorators.EnableMqGw;
import {FetchResultsGw} from "../fetch/fetch.mq.gw";
import MqGwConsumer = MqGwDecorators.MqGwConsumer;
import MqGwProducer = MqGwDecorators.MqGwProducer;
import {Component, Inject} from "@nestjs/common";


@Component()
@EnableMqGw({
         root: 'beagle',
         clients:['telegram'],
         components:[FetchResultsGw],
         connection: {
             hostname: "beagle-rabbit-mq",
             username: "rabbitmq",
             password: "rabbitmq"
         }
})
class MqGwConfig {}



export default MqGwConfig;