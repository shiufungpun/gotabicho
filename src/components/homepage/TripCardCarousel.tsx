import React from 'react';

import {Dimensions, View} from 'react-native';
import Carousel, {ICarouselInstance, Pagination} from "react-native-reanimated-carousel";
import {HEADER_MAX_HEIGHT} from "../../screens/TripListScreen";
import {Trip} from "../../types";
import {useSharedValue} from "react-native-reanimated";
import AddTripCard from "../../containers/AddTripCard";
import CarouselTripCard from "../../containers/CarouselTripCard";


const TripCardCarousel = ({trips}: { trips: (Trip & { total_expenses: number })[] }) => {
    const progress = useSharedValue<number>(0);
    const windowWidth = Dimensions.get('window').width;
    const ref = React.useRef<ICarouselInstance>(null);
    const onPressPagination = (index: number) => {
        ref.current?.scrollTo({
            count: index - progress.value,
            animated: true,
        });
    };

    const renderCarouselItem = ({item}: { item?: Trip & { total_expenses: number } }) => {
        if (!item) {
            return <AddTripCard/>;
        }
        return <CarouselTripCard trip={item}/>;
    };

    return (
        <View className="justify-center items-center" style={{paddingTop: HEADER_MAX_HEIGHT + 30}}>
            <View className={"h-full"}>
                <Carousel
                    defaultIndex={trips.length > 0 ? 1 : 0}
                    loop={false}
                    width={windowWidth}
                    height={0}
                    style={{}}
                    data={[null as any].concat(trips)}
                    scrollAnimationDuration={300}
                    onProgressChange={(offsetProgress, absoluteProgress) => {
                        progress.value = absoluteProgress;
                    }}
                    mode="parallax"
                    modeConfig={{
                        parallaxScrollingScale: 0.85,
                        parallaxScrollingOffset: 50,
                        parallaxAdjacentItemScale: 0.82,
                    }}
                    renderItem={renderCarouselItem}
                >
                </Carousel>
            </View>
            <View className={"absolute bottom-8"}>
                <Pagination.Basic<{ color: string }>
                    progress={progress}
                    data={[null as any].concat(trips)}
                    size={20}
                    dotStyle={{
                        width: 25,
                        height: 4,
                        backgroundColor: "#262626",
                    }}
                    activeDotStyle={{
                        overflow: "hidden",
                        backgroundColor: "#f1f1f1",
                    }}
                    containerStyle={[
                        {
                            gap: 5,
                        },
                    ]}
                    horizontal
                    onPress={onPressPagination}
                />
            </View>
        </View>
    );
};

export default TripCardCarousel;
